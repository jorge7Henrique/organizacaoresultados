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

Os dados são salvos em `data/resultados.json` (arquivo criado automaticamente
na primeira gravação).
