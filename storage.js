const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const usaSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);

function paraRegistro(linha) {
  return {
    id: linha.id,
    semanaInicio: linha.semana_inicio,
    semanaFim: linha.semana_fim,
    atendimentos: linha.atendimentos,
    vendas: linha.vendas,
    faturamentoTotal: Number(linha.faturamento_total),
    lucroBrutoTotal: Number(linha.lucro_bruto_total),
    criadoEm: linha.criado_em,
  };
}

function paraColunas(dados) {
  return {
    semana_inicio: dados.semanaInicio,
    semana_fim: dados.semanaFim,
    atendimentos: Number(dados.atendimentos),
    vendas: Number(dados.vendas),
    faturamento_total: Number(dados.faturamentoTotal),
    lucro_bruto_total: Number(dados.lucroBrutoTotal),
  };
}

function criarStorageSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  return {
    tipo: 'supabase',
    async listar() {
      const { data, error } = await supabase
        .from('resultados')
        .select('*')
        .order('semana_inicio', { ascending: false });
      if (error) throw error;
      return data.map(paraRegistro);
    },
    async criar(dados) {
      const { data, error } = await supabase
        .from('resultados')
        .insert(paraColunas(dados))
        .select()
        .single();
      if (error) throw error;
      return paraRegistro(data);
    },
    async atualizar(id, dados) {
      const { data, error } = await supabase
        .from('resultados')
        .update(paraColunas(dados))
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data ? paraRegistro(data) : null;
    },
    async excluir(id) {
      const { data, error } = await supabase
        .from('resultados')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  };
}

function criarStorageArquivo() {
  const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
  const DATA_FILE = path.join(DATA_DIR, 'resultados.json');

  function ler() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  }

  function salvar(resultados) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(resultados, null, 2));
  }

  // Serializa leitura+gravação para evitar corrupção quando duas pessoas
  // salvam ao mesmo tempo.
  let fila = Promise.resolve();
  function comLock(operacao) {
    const resultado = fila.then(operacao);
    fila = resultado.catch(() => {});
    return resultado;
  }

  return {
    tipo: 'arquivo',
    async listar() {
      return ler().sort((a, b) => (a.semanaInicio < b.semanaInicio ? 1 : -1));
    },
    async criar(dados) {
      return comLock(() => {
        const resultados = ler();
        const registro = {
          id: crypto.randomUUID(),
          ...dados,
          atendimentos: Number(dados.atendimentos),
          vendas: Number(dados.vendas),
          faturamentoTotal: Number(dados.faturamentoTotal),
          lucroBrutoTotal: Number(dados.lucroBrutoTotal),
          criadoEm: new Date().toISOString(),
        };
        resultados.push(registro);
        salvar(resultados);
        return registro;
      });
    },
    async atualizar(id, dados) {
      return comLock(() => {
        const resultados = ler();
        const index = resultados.findIndex((r) => r.id === id);
        if (index === -1) return null;
        resultados[index] = {
          ...resultados[index],
          ...dados,
          atendimentos: Number(dados.atendimentos),
          vendas: Number(dados.vendas),
          faturamentoTotal: Number(dados.faturamentoTotal),
          lucroBrutoTotal: Number(dados.lucroBrutoTotal),
        };
        salvar(resultados);
        return resultados[index];
      });
    },
    async excluir(id) {
      return comLock(() => {
        const resultados = ler();
        const filtrados = resultados.filter((r) => r.id !== id);
        if (filtrados.length === resultados.length) return false;
        salvar(filtrados);
        return true;
      });
    },
  };
}

module.exports = usaSupabase ? criarStorageSupabase() : criarStorageArquivo();
