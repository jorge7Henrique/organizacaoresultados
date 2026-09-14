const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'resultados.json');

function lerResultados() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function salvarResultados(resultados) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(resultados, null, 2));
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

app.get('/api/resultados', (req, res) => {
  const resultados = lerResultados().sort((a, b) => (a.semanaInicio < b.semanaInicio ? 1 : -1));
  res.json(resultados);
});

app.post('/api/resultados', (req, res) => {
  const erro = validarPayload(req.body);
  if (erro) return res.status(400).json({ erro });

  const resultados = lerResultados();
  const novo = {
    id: crypto.randomUUID(),
    semanaInicio: req.body.semanaInicio,
    semanaFim: req.body.semanaFim,
    atendimentos: Number(req.body.atendimentos),
    vendas: Number(req.body.vendas),
    faturamentoTotal: Number(req.body.faturamentoTotal),
    lucroBrutoTotal: Number(req.body.lucroBrutoTotal),
    criadoEm: new Date().toISOString(),
  };
  resultados.push(novo);
  salvarResultados(resultados);
  res.status(201).json(novo);
});

app.put('/api/resultados/:id', (req, res) => {
  const erro = validarPayload(req.body);
  if (erro) return res.status(400).json({ erro });

  const resultados = lerResultados();
  const index = resultados.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ erro: 'Registro não encontrado' });

  resultados[index] = {
    ...resultados[index],
    semanaInicio: req.body.semanaInicio,
    semanaFim: req.body.semanaFim,
    atendimentos: Number(req.body.atendimentos),
    vendas: Number(req.body.vendas),
    faturamentoTotal: Number(req.body.faturamentoTotal),
    lucroBrutoTotal: Number(req.body.lucroBrutoTotal),
  };
  salvarResultados(resultados);
  res.json(resultados[index]);
});

app.delete('/api/resultados/:id', (req, res) => {
  const resultados = lerResultados();
  const filtrados = resultados.filter((r) => r.id !== req.params.id);
  if (filtrados.length === resultados.length) {
    return res.status(404).json({ erro: 'Registro não encontrado' });
  }
  salvarResultados(filtrados);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Monitoramento de Resultados rodando em http://localhost:${PORT}`);
});
