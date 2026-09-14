const express = require('express');
const path = require('path');
const storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

const clientesSSE = new Set();
function notificarClientes() {
  for (const res of clientesSSE) {
    res.write('event: atualizado\ndata: {}\n\n');
  }
}

function validarPayload(body) {
  const campos = ['data', 'responsavel', 'atendimentos', 'vendas', 'faturamento', 'lucroBruto'];
  for (const campo of campos) {
    if (body[campo] === undefined || body[campo] === null || body[campo] === '') {
      return `Campo obrigatório ausente: ${campo}`;
    }
  }
  if (typeof body.responsavel !== 'string' || body.responsavel.trim().length === 0) {
    return 'Informe o nome do responsável pelo lançamento';
  }
  if (Number.isNaN(Number(body.atendimentos)) || Number(body.atendimentos) < 0) {
    return 'Quantidade de Atendimentos inválida';
  }
  if (Number.isNaN(Number(body.vendas)) || Number(body.vendas) < 0) {
    return 'Quantidade de Vendas inválida';
  }
  if (Number.isNaN(Number(body.faturamento)) || Number(body.faturamento) < 0) {
    return 'Faturamento inválido';
  }
  if (Number.isNaN(Number(body.lucroBruto))) {
    return 'Lucro Bruto inválido';
  }
  return null;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/dias', async (req, res) => {
  try {
    const registros = await storage.listar();
    res.json(registros);
  } catch (err) {
    console.error('Erro ao listar registros:', err);
    res.status(500).json({ erro: 'Erro ao carregar os dados. Tente novamente.' });
  }
});

app.get('/api/eventos', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  clientesSSE.add(res);
  req.on('close', () => clientesSSE.delete(res));
});

app.post('/api/dias', async (req, res) => {
  const erro = validarPayload(req.body);
  if (erro) return res.status(400).json({ erro });
  req.body.responsavel = req.body.responsavel.trim();

  try {
    const novo = await storage.criar(req.body);
    notificarClientes();
    res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao salvar registro:', err);
    res.status(500).json({ erro: 'Erro ao salvar o registro. Tente novamente.' });
  }
});

app.put('/api/dias/:id', async (req, res) => {
  const erro = validarPayload(req.body);
  if (erro) return res.status(400).json({ erro });
  req.body.responsavel = req.body.responsavel.trim();

  try {
    const atualizado = await storage.atualizar(req.params.id, req.body);
    if (!atualizado) return res.status(404).json({ erro: 'Registro não encontrado' });
    notificarClientes();
    res.json(atualizado);
  } catch (err) {
    console.error('Erro ao atualizar registro:', err);
    res.status(500).json({ erro: 'Erro ao atualizar o registro. Tente novamente.' });
  }
});

app.delete('/api/dias/:id', async (req, res) => {
  try {
    const excluiu = await storage.excluir(req.params.id);
    if (!excluiu) return res.status(404).json({ erro: 'Registro não encontrado' });
    notificarClientes();
    res.status(204).end();
  } catch (err) {
    console.error('Erro ao excluir registro:', err);
    res.status(500).json({ erro: 'Erro ao excluir o registro. Tente novamente.' });
  }
});

app.listen(PORT, () => {
  console.log(`Monitoramento de Resultados rodando em http://localhost:${PORT} (armazenamento: ${storage.tipo})`);
});
