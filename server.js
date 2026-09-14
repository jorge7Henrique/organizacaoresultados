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
  const campos = ['semanaInicio', 'semanaFim', 'atendimentos', 'vendas', 'faturamentoTotal', 'lucroBrutoTotal'];
  for (const campo of campos) {
    if (body[campo] === undefined || body[campo] === null || body[campo] === '') {
      return `Campo obrigatório ausente: ${campo}`;
    }
  }
  if (Number.isNaN(Number(body.atendimentos)) || Number(body.atendimentos) < 0) {
    return 'Quantidade de Atendimentos inválida';
  }
  if (Number.isNaN(Number(body.vendas)) || Number(body.vendas) < 0) {
    return 'Quantidade de Vendas inválida';
  }
  if (Number.isNaN(Number(body.faturamentoTotal)) || Number(body.faturamentoTotal) < 0) {
    return 'Faturamento Total inválido';
  }
  if (Number.isNaN(Number(body.lucroBrutoTotal))) {
    return 'Lucro Bruto Total inválido';
  }
  return null;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/resultados', async (req, res) => {
  const resultados = await storage.listar();
  res.json(resultados);
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

app.post('/api/resultados', async (req, res) => {
  const erro = validarPayload(req.body);
  if (erro) return res.status(400).json({ erro });

  const novo = await storage.criar(req.body);
  notificarClientes();
  res.status(201).json(novo);
});

app.put('/api/resultados/:id', async (req, res) => {
  const erro = validarPayload(req.body);
  if (erro) return res.status(400).json({ erro });

  const atualizado = await storage.atualizar(req.params.id, req.body);
  if (!atualizado) return res.status(404).json({ erro: 'Registro não encontrado' });
  notificarClientes();
  res.json(atualizado);
});

app.delete('/api/resultados/:id', async (req, res) => {
  const excluiu = await storage.excluir(req.params.id);
  if (!excluiu) return res.status(404).json({ erro: 'Registro não encontrado' });
  notificarClientes();
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Monitoramento de Resultados rodando em http://localhost:${PORT} (armazenamento: ${storage.tipo})`);
});
