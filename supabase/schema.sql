-- Execute este script no SQL Editor do Supabase (Project > SQL Editor > New query)
-- para criar a tabela usada pelo sistema de Monitoramento de Resultados.
--
-- Se você já tinha rodado a versão antiga deste script (tabela "resultados",
-- com semana_inicio/semana_fim), pode apagá-la com o comando abaixo antes de
-- continuar — nenhum lançamento chegou a ser salvo por causa do bug do botão
-- "Salvar", então não há dados para perder:
--
-- drop table if exists resultados;

create table if not exists registros_diarios (
  id uuid primary key default gen_random_uuid(),
  data date not null unique,
  atendimentos integer not null,
  vendas integer not null,
  faturamento numeric not null,
  lucro_bruto numeric not null,
  criado_em timestamptz not null default now()
);

alter table registros_diarios enable row level security;

-- Libera acesso via a chave anon usada pelo próprio servidor da aplicação.
-- (o servidor é o único que fala com o Supabase; ninguém acessa o banco direto)
create policy "acesso total via app" on registros_diarios
  for all
  using (true)
  with check (true);
