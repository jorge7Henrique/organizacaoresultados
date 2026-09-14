# Monitoramento de Resultados Semanal 💚✈️

Sistema simples para registrar e acompanhar os resultados semanais da empresa.

## Dados registrados por semana

- Quantidade de Atendimentos
- Quantidade de Vendas
- Conversão (calculada automaticamente: vendas ÷ atendimentos)
- Faturamento Total
- Lucro Bruto Total

## Como rodar

```bash
npm install
npm start
```

Depois acesse `http://localhost:3000`.

## Como funciona

- Formulário no topo para cadastrar (ou editar) o resultado de uma semana.
- Resumo geral com totais e conversão média de todas as semanas.
- Histórico com todas as semanas cadastradas, com opção de editar ou excluir.
- Atualização em tempo real: quando uma pessoa cadastra, edita ou exclui um
  resultado, todas as outras pessoas com a página aberta veem a mudança na
  hora, sem precisar recarregar.

Por padrão os dados são salvos em `data/resultados.json` (arquivo criado
automaticamente na primeira gravação) — útil para rodar no seu computador.
Para uso em produção com o plano **gratuito**, o sistema troca automaticamente
para um banco de dados Supabase quando as variáveis `SUPABASE_URL` e
`SUPABASE_KEY` estão configuradas (veja abaixo).

## Colocando no ar de graça para acessar de cidades diferentes

Para você e o funcionário acessarem o mesmo sistema morando em lugares
diferentes, ele precisa estar hospedado num endereço da internet — não basta
rodar `npm start` no seu próprio computador. O plano gratuito do Render não
permite guardar arquivos permanentemente, então usamos o **Supabase**
(banco de dados gratuito) para guardar os resultados, e o **Render**
(plano gratuito) para hospedar o site. Nenhum dos dois pede cartão de crédito.

### 1. Criar o banco de dados no Supabase

1. Crie uma conta grátis em [supabase.com](https://supabase.com).
2. Clique em **New Project**, dê um nome (ex.: `monitoramento-resultados`) e
   uma senha para o banco (guarde essa senha em local seguro).
3. Depois que o projeto for criado, vá em **SQL Editor** → **New query**,
   cole o conteúdo do arquivo [`supabase/schema.sql`](supabase/schema.sql)
   deste repositório e clique em **Run**. Isso cria a tabela onde os
   resultados semanais ficam guardados.
4. Vá em **Project Settings** → **API**. Anote dois valores que serão usados
   no próximo passo:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (uma chave longa)

### 2. Publicar o site no Render

1. Crie uma conta grátis em [render.com](https://render.com) (dá para entrar
   com a conta do GitHub).
2. No painel do Render, clique em **New +** → **Blueprint**.
3. Conecte sua conta do GitHub e selecione o repositório
   `organizacaoresultados`. O Render detecta o arquivo `render.yaml`
   automaticamente e sugere criar o serviço `monitoramento-resultados` no
   plano **Free**.
4. Durante a criação, o Render vai pedir os valores de `SUPABASE_URL` e
   `SUPABASE_KEY` — cole ali a **Project URL** e a **anon public key** que
   você anotou no Supabase.
5. Clique em **Apply**. O primeiro deploy leva alguns minutos.
6. Quando terminar, o Render mostra uma URL pública, algo como
   `https://monitoramento-resultados.onrender.com`. Essa é a página que você e
   o funcionário devem acessar — pode salvar como favorito ou atalho no
   celular/computador dos dois.
7. Sempre que o código for atualizado (PR aprovado e mesclado), o Render
   publica a nova versão automaticamente.

> **Sobre o plano gratuito do Render:** o serviço "dorme" depois de 15 minutos
> sem uso e demora uns 30-50 segundos para acordar no primeiro acesso depois
> disso — tranquilo para um sistema de uso semanal como esse. Os dados nunca
> se perdem porque ficam guardados no Supabase, não no Render.
