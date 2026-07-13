# Comparador de Manejo Foliar

Protótipo para montar um manejo foliar selecionando produtos de diferentes
empresas, somar os nutrientes fornecidos (g/ha) e comparar custo e nutrição
com a linha Agrocete.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Estrutura

- `src/AgroComparador.jsx` — componente principal (dados dos produtos,
  cálculo de somatória de nutrientes, comparação de custo).
- `src/main.jsx` — ponto de entrada React.

## Dados dos produtos

Os produtos concorrentes (Fortgreen, Stoller, ICL, Ballagro) já vêm
com garantias de nutrientes reais extraídas dos catálogos.

A seção "2 · Linha Agrocete" já vem pré-carregada com o catálogo oficial
da **Linha GRAP** (28 produtos), extraído do Folheto de Garantias Agrocete
de maio/2023 (`GRAP_CATALOG` em `AgroComparador.jsx`). As garantias do
folheto são percentuais (%m/m); a densidade de cada produto foi usada para
convertê-las para g/L na hora de montar o catálogo (`g/L = % × densidade
× 10`), mesma técnica já usada para os produtos Ballagro — o código
armazena apenas o resultado final em `nutrients`, não a densidade de
origem, então para auditar um valor é preciso voltar ao folheto (`fonte`
de cada produto). Produtos do folheto sem garantia de nutriente
(adjuvantes, inoculantes, limpeza de equipamento) não entraram no
catálogo, pois não há o que comparar no gráfico de nutrientes. As doses
padrão são um valor genérico de partida — ajuste conforme a
bula/recomendação técnica de cada produto.

Produtos que não estejam no catálogo oficial podem ser cadastrados à mão
pelo formulário "Adicionar produto Agrocete" dentro do app.

## Persistência

O manejo montado (produtos selecionados, doses e preços, tanto dos
concorrentes quanto os cadastrados na linha Agrocete) é salvo
automaticamente no `localStorage` do navegador a cada alteração, sob a
chave `agro-comparador-state-v1`. Ao recarregar a página o estado é
restaurado. Isso é armazenamento local por navegador/dispositivo — não
sincroniza entre aparelhos nem sobrevive a "limpar dados do site".

## Exportar em PDF

O botão "Exportar comparativo em PDF", exibido junto ao comparativo de
nutrientes, gera um PDF com a lista de produtos selecionados (dose e
preço), a tabela de nutrientes (g/ha) por lado e o resumo de custo por
hectare. A biblioteca `jspdf` é carregada sob demanda (import dinâmico)
só quando o botão é clicado, para não pesar o bundle inicial do app.

## Deploy na Vercel

O projeto já inclui um `vercel.json` com o preset do Vite
(`npm run build`, saída em `dist/`). Para publicar:

```bash
npm i -g vercel   # se ainda não tiver a CLI
vercel
```

Ou importe o repositório diretamente em https://vercel.com/new — a
Vercel detecta o framework Vite automaticamente.

## Próximos passos sugeridos (para pedir ao Claude Code)

- Adicionar as demais empresas do portfólio (Brandt, Multifol, Prime,
  Genica, Arggus, Valence, União Agro etc.), extraindo as garantias de
  nutrientes dos PDFs de cada uma.
- Permitir exportar/importar o manejo montado como JSON, para
  compartilhar entre dispositivos sem depender só do `localStorage`.
