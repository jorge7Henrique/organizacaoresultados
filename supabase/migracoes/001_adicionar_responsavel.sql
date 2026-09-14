-- Rode este script no SQL Editor do Supabase SE você já tinha criado a
-- tabela registros_diarios antes (sem a coluna "responsavel").
-- Ele adiciona a coluna e ajusta a regra de duplicidade para "por pessoa,
-- por dia" em vez de "só um lançamento por dia".

alter table registros_diarios
  add column if not exists responsavel text not null default 'Não informado';

alter table registros_diarios
  alter column responsavel drop default;

alter table registros_diarios
  drop constraint if exists registros_diarios_data_key;

alter table registros_diarios
  add constraint registros_diarios_data_responsavel_key unique (data, responsavel);
