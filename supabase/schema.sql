-- Execute este script no SQL Editor do Supabase (Project > SQL Editor > New query)
-- para criar a tabela usada pelo sistema de Monitoramento de Resultados.
--
-- Se você AINDA NÃO tem a tabela registros_diarios (primeira vez configurando),
-- rode este bloco:

create table if not exists registros_diarios (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  responsavel text not null,
  atendimentos integer not null,
  vendas integer not null,
  faturamento numeric not null,
  lucro_bruto numeric not null,
  criado_em timestamptz not null default now(),
  unique (data, responsavel)
);

alter table registros_diarios enable row level security;

drop policy if exists "acesso total via app" on registros_diarios;
create policy "acesso total via app" on registros_diarios
  for all
  using (true)
  with check (true);
