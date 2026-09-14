const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const usaSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);

function paraRegistro(linha) {
  return {
    id: linha.id,
    data: linha.data,
    atendimentos: linha.atendimentos,
    vendas: linha.vendas,
    faturamento: Number(linha.faturamento),
    lucroBruto: Number(linha.lucro_bruto),
    criadoEm: linha.criado_em,
  };
}

function paraColunas(dados) {
  return {
    data: dados.data,
    atendimentos: Number(dados.atendimentos),
    vendas: Number(dados.vendas),
    faturamento: Number(dados.faturamento),
    lucro_bruto: Number(dados.lucroBruto),
  };
}

function criarStorageSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  return {
    tipo: 'supabase',
    async listar() {
      const { data, error } = await supabase
        .from('registros_diarios')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data.map(paraRegistro);
    },
    async criar(dados) {
      // Um lançamento por dia: se já existir um registro para essa data,
      // atualiza em vez de duplicar.
      const { data, error } = await supabase
        .from('registros_diarios')
        .upsert(paraColunas(dados), { onConflict: 'data' })
        .select()
        .single();
      if (error) throw error;
      return paraRegistro(data);
    },
    async atualizar(id, dados) {
      const { data, error } = await supabase
        .from('registros_diarios')
        .update(paraColunas(dados))
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data ? paraRegistro(data) : null;
    },
    async excluir(id) {
      const { data, error } = await supabase
        .from('registros_diarios')
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
  const DATA_FILE = path.join(DATA_DIR, 'registros.json');

  function ler() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (!raw) return [];
    return JSON.parse(raw);
  }

  function salvar(registros) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(registros, null, 2));
  }

  // Serializa leitura+gravação para evitar corrupção quando duas pessoas
  // salvam ao mesmo tempo.
  let fila = Promise.resolve();
  function comLock(operacao) {
    const resultado = fila.then(operacao);
    fila = resultado.catch(() => {});
    return resultado;
  }

  function valores(dados) {
    return {
      data: dados.data,
      atendimentos: Number(dados.atendimentos),
      vendas: Number(dados.vendas),
      faturamento: Number(dados.faturamento),
      lucroBruto: Number(dados.lucroBruto),
    };
  }

  return {
    tipo: 'arquivo',
    async listar() {
      return ler().sort((a, b) => (a.data < b.data ? 1 : -1));
    },
    async criar(dados) {
      return comLock(() => {
        const registros = ler();
        const existente = registros.find((r) => r.data === dados.data);
        if (existente) {
          Object.assign(existente, valores(dados));
          salvar(registros);
          return existente;
        }
        const registro = { id: crypto.randomUUID(), ...valores(dados), criadoEm: new Date().toISOString() };
        registros.push(registro);
        salvar(registros);
        return registro;
      });
    },
    async atualizar(id, dados) {
      return comLock(() => {
        const registros = ler();
        const index = registros.findIndex((r) => r.id === id);
        if (index === -1) return null;
        registros[index] = { ...registros[index], ...valores(dados) };
        salvar(registros);
        return registros[index];
      });
    },
    async excluir(id) {
      return comLock(() => {
        const registros = ler();
        const filtrados = registros.filter((r) => r.id !== id);
        if (filtrados.length === registros.length) return false;
        salvar(filtrados);
        return true;
      });
    },
  };
}

module.exports = usaSupabase ? criarStorageSupabase() : criarStorageArquivo();
