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

Os dados são salvos em `data/resultados.json` (arquivo criado automaticamente
na primeira gravação). Em produção, o caminho da pasta de dados pode ser
alterado com a variável de ambiente `DATA_DIR`.

## Colocando no ar para acessar de cidades diferentes (Render)

Para você e o funcionário acessarem o mesmo sistema morando em lugares
diferentes, ele precisa estar hospedado num endereço da internet — não basta
rodar `npm start` no seu próprio computador. Passo a passo usando o
[Render](https://render.com) (o repositório já inclui o arquivo `render.yaml`
com a configuração pronta):

1. Crie uma conta em [render.com](https://render.com) (dá para entrar com a
   conta do GitHub).
2. No painel do Render, clique em **New +** → **Blueprint**.
3. Conecte sua conta do GitHub e selecione o repositório
   `organizacaoresultados`.
4. O Render vai detectar o arquivo `render.yaml` automaticamente e sugerir a
   criação do serviço `monitoramento-resultados`, já com um disco persistente
   de 1GB para guardar os dados cadastrados (plano **Starter**, pago, necessário
   para o disco não ser apagado a cada atualização).
5. Clique em **Apply** para criar o serviço. O primeiro deploy leva alguns
   minutos.
6. Quando terminar, o Render mostra uma URL pública, algo como
   `https://monitoramento-resultados.onrender.com`. Essa é a página que você e
   o funcionário devem acessar — pode salvar como favorito ou atalho no
   celular/computador dos dois.
7. Sempre que houver uma atualização no código (novo PR aprovado e mesclado),
   o Render publica a nova versão automaticamente.

> **Importante:** o plano gratuito do Render não suporta disco persistente —
> os dados cadastrados seriam perdidos a cada reinício do serviço. Por isso a
> configuração usa o plano **Starter** (pago, valor baixo) com disco de 1GB
> dedicado aos resultados.
