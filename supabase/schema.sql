-- Execute este script no SQL Editor do Supabase (Project > SQL Editor > New query)
-- para criar a tabela usada pelo sistema de Monitoramento de Resultados.

create table if not exists resultados (
  id uuid primary key default gen_random_uuid(),
  semana_inicio date not null,
  semana_fim date not null,
  atendimentos integer not null,
  vendas integer not null,
  faturamento_total numeric not null,
  lucro_bruto_total numeric not null,
  criado_em timestamptz not null default now()
);

alter table resultados enable row level security;

-- Libera acesso via a chave anon usada pelo próprio servidor da aplicação.
-- (o servidor é o único que fala com o Supabase; ninguém acessa o banco direto)
create policy "acesso total via app" on resultados
  for all
  using (true)
  with check (true);
