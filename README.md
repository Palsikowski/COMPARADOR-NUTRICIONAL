# Painel Agrocete — Comparador de Portfólio x Mercado

Dashboard para agilizar cotações: navegue pelo portfólio completo da
Agrocete e de 11 marcas concorrentes, monte um comparativo de nutrientes
(g/ha) e custo, e veja o posicionamento técnico calculado automaticamente
a partir dos dados reais das planilhas internas.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Senha padrão: `12345678` (veja "Tela de
senha" abaixo para trocar).

## Estrutura

- `src/Dashboard.jsx` — componente principal: navegação por categoria
  (equivalência) ou por marca, seleção de produtos, comparativo de
  nutrientes/custo, posicionamento técnico, exportação em PDF.
- `src/PasswordGate.jsx` — tela de senha antes de carregar o dashboard.
- `src/main.jsx` — ponto de entrada React.
- `src/data/products.js` — catálogo de 308 produtos (Agrocete + 11
  marcas concorrentes), gerado a partir de planilha interna.
- `src/data/equivalences.js` — matriz de 35 linhas de produto,
  mapeando o produto Agrocete e o equivalente de cada marca
  concorrente (quando existe).
- `src/data/brands.js` — lista das marcas concorrentes presentes em
  `products.js`.

## Dados dos produtos

Todo o catálogo (`src/data/*.js`) foi gerado automaticamente a partir de
duas planilhas internas da Agrocete (não versionadas no repositório —
os dados extraídos já estão embutidos nos arquivos `.js`):

- **Dados Nutricionais Agrocete x Concorrentes** — uma aba por marca
  (Agrocete, Arggus, Bioma, Biotrop, F1rst Agbiotech, Giro Agro, ICL,
  Nodusoja/Noduagri, Satis, Simbiose, Vittia, Viva Bio), com nome,
  composição, dose, garantia de nutrientes (%m/m) e densidade de cada
  produto. As garantias foram convertidas para o que o app usa nos
  cálculos: **g/L** para produtos líquidos (`nutrients = %m/m ×
  densidade × 10`) e **g/kg** para produtos sólidos, sem densidade
  informada (`nutrients = %m/m × 10`). O valor percentual original fica
  guardado em `nutrientsPercent` em cada produto, para auditoria.
- **Comparativo de Portfólio de Mercado** — matriz "P. Similares", que
  lista pra cada categoria/composição o produto Agrocete e o nome do
  produto equivalente em até 20 marcas. Nem toda marca dessa matriz tem
  aba de dados nutricionais na primeira planilha — quando não tem (ou
  quando o nome não bateu exatamente com o catalogado), o produto
  aparece só como referência textual (chip cinza, não clicável) em vez
  de entrar no comparativo numérico.

**Limitações conhecidas dos dados** (herdadas das planilhas-fonte, não
"corrigidas" para não inventar informação):
- Doses (`defaultDose`) são estimadas a partir do primeiro número
  encontrado no texto de dose da planilha — ponto de partida, não
  recomendação agronômica. Ajuste sempre conforme a bula.
- Das ~272 referências de produtos concorrentes na matriz de
  equivalência, só ~50 puderam ser casadas com dados nutricionais
  reais (a maioria das 20 marcas da matriz não tem aba própria na
  planilha de nutrientes).
- Três produtos que apareciam no folheto GRAP em PDF usado numa versão
  anterior do app (GRAP CAFÉ, GRAP FRUTAS, GRAP PHIL K) não estão na
  planilha interna mais recente e por isso não aparecem mais no
  catálogo — se ainda forem vendidos, cadastre-os manualmente.

Produtos que não estejam no catálogo podem ser cadastrados à mão pelo
botão "Adicionar produto Agrocete manualmente", dentro do painel da
marca AGROCETE (aba "Por marca").

## Posicionamento técnico

Sempre que exatamente um produto Agrocete e um produto concorrente
(ambos com dados de nutrientes) estiverem selecionados ao mesmo tempo,
o painel calcula automaticamente a diferença percentual de cada
nutriente em comum entre os dois — números reais, não texto genérico.
Além disso, qualquer observação ou alerta já cadastrado na planilha
para um produto Agrocete selecionado (ex: índice salino, incompatibilidade
com herbicida, ganho de absorção) aparece nessa mesma seção.

## Persistência

A seleção de produtos (doses e preços) é salva automaticamente no
`localStorage` do navegador a cada alteração, sob a chave
`agro-dashboard-state-v1`. Ao recarregar a página o estado é
restaurado. É armazenamento local por navegador/dispositivo — não
sincroniza entre aparelhos.

## Tela de senha

O app fica atrás de uma tela de senha simples (`src/PasswordGate.jsx`)
antes de carregar o dashboard — pensada para publicações em hosts
gratuitos, onde não dá pra restringir acesso de outra forma sem custo.
Só o hash SHA-256 da senha fica no código (não a senha em texto puro),
mas isso **não é segurança de verdade**: qualquer pessoa com acesso ao
código-fonte da página pode tentar quebrar o hash offline. Serve para
não deixar o app aberto para quem simplesmente achar o link.

Para trocar a senha, gere o novo hash e substitua a constante
`PASSWORD_HASH` em `src/PasswordGate.jsx`:

```bash
node -e "
const { webcrypto } = require('crypto');
(async () => {
  const bytes = new TextEncoder().encode('SUA_SENHA_AQUI');
  const digest = await webcrypto.subtle.digest('SHA-256', bytes);
  console.log(Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join(''));
})();
"
```

Depois de acertar a senha uma vez, o navegador lembra (via
`localStorage`) e não pede de novo nesse dispositivo.

## Exportar em PDF

O botão "Exportar comparativo em PDF" gera um PDF com a lista de
produtos selecionados (dose e preço), a tabela de nutrientes (g/ha) por
lado, o resumo de custo e as notas de posicionamento técnico. A
biblioteca `jspdf` é carregada sob demanda (import dinâmico) só quando
o botão é clicado, para não pesar o bundle inicial do app.

## Deploy na Vercel

O projeto já inclui um `vercel.json` com o preset do Vite
(`npm run build`, saída em `dist/`). Para publicar:

```bash
npm i -g vercel   # se ainda não tiver a CLI
vercel
```

Ou importe o repositório diretamente em https://vercel.com/new — a
Vercel detecta o framework Vite automaticamente.

## Deploy como arquivo único (Firebase Hosting e afins)

Para hosts estáticos simples (Firebase Hosting, GitHub Pages, ou
"arrastar e soltar" um único arquivo), gere uma versão com tudo
embutido em um único `index.html` (CSS e JS inline, sem arquivos
externos):

```bash
npm run build:standalone
```

Isso cria `dist-standalone/index.html` — um arquivo autocontido de
~1,1 MB que funciona sozinho, sem servidor (testado até abrindo direto
via `file://`).

O `firebase.json` do projeto já está configurado (`"public":
"dist-standalone"`), então não precisa rodar `firebase init` — só
autenticar, linkar o projeto e publicar:

```bash
npm i -g firebase-tools   # se ainda não tiver a CLI
firebase login            # autentica com sua conta Google
firebase use --add        # escolhe/cria o projeto Firebase e grava .firebaserc
npm run deploy:firebase   # gera o build standalone e publica
```

`firebase use --add` grava um `.firebaserc` local com o ID do projeto
escolhido — esse arquivo não é versionado (fica no `.gitignore`) porque
o ID do projeto Firebase é específico de cada pessoa/conta. Depois do
primeiro `firebase use --add`, só rodar `npm run deploy:firebase` nas
próximas vezes.

Diferença para o build normal (`npm run build`, usado no deploy da
Vercel): o build normal divide o app em vários arquivos (JS/CSS
separados, com `jspdf` carregado sob demanda só quando o botão de
exportar é clicado) — mais eficiente para carregamento inicial. O
build standalone embute tudo, incluindo o `jspdf`, no próprio
`index.html`, então o arquivo é maior mas roda em qualquer lugar sem
depender de múltiplos arquivos.

## Próximos passos sugeridos (para pedir ao Claude Code)

- Melhorar o casamento de nomes na matriz de equivalência (hoje só
  ~18% das referências de concorrentes batem com um produto
  catalogado) para aumentar a cobertura do comparativo automático.
- Adicionar abas de nutrientes para as marcas que só têm nome de
  produto na matriz de equivalência (Ballagro, Lallemand, Genica,
  Koppert, Union Agro, Ubyfol, Nitro, Gran7, Dimicron, Syngenta
  Biológicals), se houver dados/fichas técnicas disponíveis.
- Permitir exportar/importar a seleção como JSON, para compartilhar
  entre dispositivos sem depender só do `localStorage`.
