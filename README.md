# Painel Agrocete — Comparador de Portfólio x Mercado

Dashboard para agilizar cotações: navegue pelo portfólio completo da
Agrocete e de 57 marcas concorrentes, monte um comparativo de nutrientes
(g/ha) e custo, cadastre e trave a dose de cada produto pra já ver a
concentração de nutrientes calculada, e veja o posicionamento técnico
calculado automaticamente a partir dos dados reais das planilhas internas.

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
- `src/dashboard/DoseStepper.jsx` — stepper +/- com aceleração em
  long-press, duplo toque alterna passo fino (0,1) / grosso (1,0), e
  slider horizontal sincronizado.
- `src/dashboard/CurrentManagement.jsx` — lista "Manejo atual" com
  remoção por swipe (touch) ou clique.
- `src/dashboard/TemplatesPanel.jsx` — salvar/carregar/renomear/excluir
  manejos (combinação de produtos + doses) como templates nomeados.
- `src/dashboard/BottomSheet.jsx` — resumo fixo arrastável (estilo
  Google Maps) com macros-chave e custo, expansível em tela cheia. Só
  aparece em telas estreitas (`.mobile-only`); no desktop o resumo
  equivalente fica na barra lateral fixa.
- `src/dashboard/QuickEditDrawer.jsx` — drawer que abre por cima do
  conteúdo para editar dose (stepper + slider + passo fino) e preço de
  um produto, sem precisar expandir o card na lista.
- `src/dashboard/CostEfficiency.jsx` — cálculo de R$/kg por nutriente
  entregue, insights automáticos, a barra de comparação compacta
  (`CompareBar`, cor fixa por identidade: verde = Agrocete, cinza =
  concorrente) e o selo `NutrientBadge` ("▲ +23%" / "só Agrocete").
- `src/dashboard/DoseRegistryPanel.jsx` — aba "Cadastro de doses":
  lista os produtos sem dose (com busca, filtro por marca e os toggles
  "só sem dose" / "só com nutrientes"), deixa digitar e travar a dose
  de cada um, mostra a concentração de cada nutriente calculada na hora
  (dose × concentração por unidade) e exporta/importa o cadastro em
  JSON. Ver seção "Cadastro de doses" abaixo.
- `src/dashboard.css` — micro-interações que inline styles não
  expressam: escala ao tocar, accordion com altura suave, pulso do
  bottom sheet, estilo do slider.
- `src/PasswordGate.jsx` — tela de senha antes de carregar o dashboard.
- `src/main.jsx` — ponto de entrada React.
- `src/data/products.js` — catálogo de 1521 produtos (Agrocete + 57
  marcas concorrentes), gerado a partir de planilhas internas.
- `src/data/equivalences.js` — matriz de 35 linhas de produto,
  mapeando o produto Agrocete e o equivalente de cada marca
  concorrente (quando existe).
- `src/data/brands.js` — lista das marcas concorrentes presentes em
  `products.js`.
- `src/data/managementPresets.js` — manejos prontos por cultura (Soja,
  Milho, Algodão) x nível de investimento (Básico/Médio/Completo),
  baseados no material oficial "Manejo Atualizado 2024" da Agrocete.
- `src/dashboard/ManagementPresetsPanel.jsx` — painel na barra lateral
  pra escolher cultura + nível e carregar o manejo pronto de um toque.
- `src/dashboard/suggestAgrocete.js` — heurística que sugere produtos
  Agrocete pra cobrir o déficit de nutrientes de um manejo concorrente
  (qualquer combinação de marcas).
- `src/dashboard/SuggestionPanel.jsx` — painel que mostra e aplica essa
  sugestão automática dentro do comparativo.

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
- **BIOCHIM e UBYFOL** — 26 produtos (16 + 10) vieram de uma planilha à
  parte enviada pelo usuário (`DIEL.pdf`), já com concentração em g/L ou
  g/kg calculada (não passou pela conversão %m/m → g/L acima). A dose de
  cada produto foi extraída por coordenada exata das células do PDF
  (não por OCR visual) e cada coluna de nutriente foi conferida contra a
  linha "TOTAL" da própria planilha até bater 100% — inclusive corrigiu
  dois erros de leitura que só apareceram nessa conferência. "L/ha" foi
  assumido como unidade padrão por não estar especificado na planilha;
  corrija pra "kg/ha" nos produtos que forem sólidos/em pó. O produto
  "ML 14" da Ubyfol não tinha dose informada — preencha antes de cotar.
- **218 produtos "só nome"** — todo produto concorrente que aparecia na
  matriz de equivalência apenas como referência textual (chip cinza, não
  clicável, sem dado nutricional) virou um produto de verdade no
  catálogo: `hasNutrients: false`, sem concentração cadastrada ainda,
  mas já selecionável, com dose/preço editáveis e contando no custo
  total do manejo. 3 desses nomes na verdade já eram os produtos reais
  da Ubyfol cadastrados acima (grafados diferente na matriz — "Mag-8" =
  "Mag8", "MS-Boro" = "MS Boro", "CoMo ML14" = "ML 14") e foram ligados
  ao produto certo em vez de duplicados. Isso também trouxe 12 marcas
  novas pro catálogo (Agrivalle, Ballagro, Dimicron, Fortgreen/F1rst
  Agbiotech, Genica, Giro Agro/Viva Bio, Gran7, Koppert, Lallemand,
  Nitro, Syngenta Biológicals, Union Agro — algumas aparecem com o nome
  duplo exatamente como constava na planilha de equivalência). Preencha
  as concentrações desses produtos abrindo o card e editando, ou peça
  pro Claude Code cadastrar a partir de uma ficha técnica/planilha.
- **969 produtos de 33 marcas, vindos da planilha "Produtos
  Nutricionais"** enviada pelo usuário (ago/2026) — 996 linhas no
  total, uma aba só com nome do produto, %m/m por nutriente e
  densidade (sem nenhuma coluna de dose). 32 marcas são novas no
  catálogo (Agrária, Agrichem, Agrolatina, Agroplanta, Ajinomoto,
  Alltech, Altagro, Aminoagro, Biolchim, Biosoja, BMS, Brasilquímica,
  Compass Minerals, Compo, Defensive, Fertilizantes Heringer, Intercuf,
  Kimberlit, Microfol, Microquímica, Multitécnica, Nutriplant,
  Oxiquímica, Quimifol, Samaritá, Sipcam-Nichino, Stoller, Tradecorp,
  Unisolo, UPL, Valagro, Yara); o restante entrou em marcas já
  existentes (Giro Agro, Ubyfol e a própria Agrocete). Essa planilha
  também trouxe 3 nutrientes/atributos novos ao `NUTRIENT_META`: Si
  (Silício), Aminoácidos e Substâncias Húmicas. Como não há dose
  nenhuma informada, todo produto novo entrou com `defaultDose: null`
  — use a aba **Cadastro de doses** (ver seção abaixo) pra preencher e
  travar aos poucos. Onde essa planilha batia com produto já
  cadastrado, cada caso foi resolvido puxando o outro lado do
  comparativo pra decidir (não sobrescrito automaticamente):
  - 6 produtos "só nome" da Giro Agro/Viva Bio (Clean, Evo K, Strong,
    Evo MoP, Evo Mag, New) e 1 da Ubyfol (Kymon) ganharam a
    concentração de nutrientes que ainda não tinham.
  - 16 produtos Agrocete já cadastrados tiveram a densidade atualizada
    (diferenças pequenas, de arredondamento — ex: 1,32→1,30 g/cm³),
    mantendo o %m/m já cadastrado. Só o **GRAP 140 FLUID** teve uma
    diferença real sugerida pela planilha nova (Enxofre 7%→8%,
    Manganês 12%→14%), mas a própria observação já cadastrada nesse
    produto diz que 12%/7% é a formulação atual (com mais
    complexante) e 14%/8% era a anterior — o %m/m desse produto **não**
    foi alterado (só a densidade), e o campo `fonte` dele documenta a
    divergência encontrada pra alguém confirmar com a ficha técnica.
  - **GRAP CAFÉ** e **GRAP FRUTAS**, removidos do catálogo numa versão
    anterior por não estarem na planilha interna da época (ver
    limitação abaixo), voltaram com os dados desta planilha nova.
  - Nomes duplicados dentro da mesma marca na planilha nova (ex: 4
    variações de "CobalMoly" com Mo/densidade diferentes) ganharam um
    sufixo entre parênteses com o nutriente que os diferencia; um caso
    de duplicata exata (mesmo nome, mesmo %m/m) foi descartado.

**Limitações conhecidas dos dados** (herdadas das planilhas-fonte, não
"corrigidas" para não inventar informação):
- Doses (`defaultDose`) são estimadas a partir do primeiro número
  encontrado no texto de dose da planilha — ponto de partida, não
  recomendação agronômica. Ajuste sempre conforme a bula. Os produtos
  vindos da planilha "Produtos Nutricionais" não têm `defaultDose`
  nenhum (a planilha de origem não tem coluna de dose) — cadastre pelo
  painel "Cadastro de doses".
- Das ~272 referências de produtos concorrentes na matriz de
  equivalência, ~50 têm dados nutricionais reais cadastrados (das
  planilhas de nutrientes, Biochim e Ubyfol); as outras ~218 estão no
  catálogo com nome, marca e categoria, mas sem concentração — ver
  "218 produtos 'só nome'" acima.
- Dois produtos que apareciam no folheto GRAP em PDF usado numa versão
  anterior do app (GRAP CAFÉ, GRAP FRUTAS) voltaram ao catálogo com os
  dados da planilha "Produtos Nutricionais". Um terceiro, GRAP PHIL K,
  continua fora por não aparecer em nenhuma das planilhas — se ainda
  for vendido, cadastre manualmente.

Produtos que não estejam no catálogo podem ser cadastrados à mão pelo
botão "Adicionar produto Agrocete manualmente", dentro do painel da
marca AGROCETE (aba "Por marca").

## Cadastro de doses

Terceira aba do catálogo (ao lado de "Por categoria" e "Por marca"),
pensada especificamente pra ir preenchendo os 954 produtos que têm
garantia de nutrientes cadastrada (`hasNutrients: true`) mas ainda não
têm dose nenhuma — principalmente os que vieram da planilha "Produtos
Nutricionais" (ver seção "Dados dos produtos" acima), que não tinha
coluna de dose.

- **Barra de progresso** no topo mostra quantos produtos do catálogo
  inteiro já têm dose cadastrada (seja a `defaultDose` original da
  planilha, seja uma dose travada aqui) e quantos com nutrientes ainda
  estão esperando.
- **Busca + filtro por marca + toggles** ("Só sem dose", ligado por
  padrão, e "Só com nutrientes", também ligado por padrão) — pra não
  precisar rolar os 1521 produtos do catálogo pra achar o que falta.
  A lista carrega 50 produtos por vez ("Carregar mais") pra não pesar
  a página mesmo em filtros mais largos.
- **Digitar a dose já mostra a concentração calculada** de cada
  nutriente (dose × concentração por unidade do produto, o mesmo
  cálculo usado no comparativo principal) antes mesmo de travar — dá
  pra testar o número antes de confirmar.
- **Travar** (ícone de cadeado) salva a dose como a dose oficial
  daquele produto: o campo e a unidade ficam bloqueados pra edição
  (evita mudar sem querer), o produto sai da lista "Só sem dose" e
  passa a contar na barra de progresso. **Destravar** reabre pra
  edição. Só é possível travar com uma dose numérica maior que zero.
- Quando o produto já tem unidade conhecida (`L/ha` ou `kg/ha`, vinda
  da densidade cadastrada), ela aparece fixa; quando não tem (produto
  sem densidade informada), um seletor deixa escolher antes de travar.
- Produtos com dose travada aqui ganham um ícone de cadeado ao lado do
  nome no catálogo normal (abas "Por categoria"/"Por marca"), e essa
  dose passa a ser o valor inicial ao selecionar o produto pra
  comparação (em vez de cair em 0 ou na `defaultDose` original).
- **Exportar doses (JSON)** baixa o cadastro inteiro (travado ou não)
  pra levar entre dispositivos ou mandar de volta pra consolidar no
  catálogo de verdade; **Importar** lê esse mesmo arquivo de volta,
  mesclando com o que já existir.
- Persistido em `localStorage` junto com o resto do estado do app (ver
  "Persistência" abaixo) — por navegador/dispositivo, não sincroniza
  sozinho entre aparelhos; use exportar/importar pra isso.

## Posicionamento técnico

Sempre que exatamente um produto Agrocete e um produto concorrente
(ambos com dados de nutrientes) estiverem selecionados ao mesmo tempo,
o painel calcula automaticamente a diferença percentual de cada
nutriente em comum entre os dois — números reais, não texto genérico.
Além disso, qualquer observação ou alerta já cadastrado na planilha
para um produto Agrocete selecionado (ex: índice salino, incompatibilidade
com herbicida, ganho de absorção) aparece nessa mesma seção.

## Custo-benefício por nutriente

Para cada nutriente do comparativo, o painel calcula R$ por kg
entregue em cada manejo (custo total do manejo ÷ total daquele
nutriente) — é um índice agregado, não uma alocação exata de custo por
nutriente de um produto multi-nutriente, mas é o proxy padrão usado no
agro pra comparar "custo por kg de nutriente" de um programa inteiro.
Quando a diferença entre os dois manejos passa de 15% num nutriente, um
selo de insight aparece automaticamente (ex: "Agrocete entrega Cálcio
23% mais barato por kg que o concorrente") — o texto muda de lado
conforme o resultado real, não é fixo a favor da Agrocete. Os insights
entram também na exportação em PDF.

## Manejo concorrente multi-marca + sugestão automática de manejo Agrocete

Você pode montar um manejo só com produtos concorrentes escolhendo
livremente entre as 57 marcas mapeadas (ex: um produto da Vittia + um
da Bioma) — todo produto que não for da Agrocete entra automaticamente
no mesmo lado "concorrentes" do comparativo, então já dá pra montar
esse manejo hoje sem nenhuma mudança adicional.

O "Manejo atual" agora aparece **lado a lado**: uma coluna
"Concorrentes" e uma coluna "Agrocete", cada uma com seus produtos e
doses, pra comparar de relance quem tem o quê — sem precisar abrir o
comparativo completo pra isso.

Assim que existe pelo menos um produto concorrente selecionado, aparece
um botão **"Transformar em manejo Agrocete"** logo abaixo dessas
colunas — um clique só. Ele descarta o que estiver selecionado do lado
Agrocete e monta do zero, a partir do total de nutrientes do manejo
concorrente inteiro (qualquer combinação de marcas), a melhor
aproximação com produtos Agrocete reais do catálogo, pra já ter uma
base de manejo pronta e só ir ajustando depois. O botão **sempre dá um
retorno visível**: mostra quantos produtos foram adicionados e, se
sobrar algum nutriente sem cobertura completa (ex: um nutriente que
nenhum produto Agrocete do catálogo concentra o bastante, como
Cálcio ou Níquel — nenhuma linha do portfólio Agrocete tem esses dois
hoje), avisa explicitamente em vez de simplesmente não fazer nada.

Mais abaixo, no comparativo, o mesmo cálculo aparece de novo no painel
**"Sugestão de manejo Agrocete equivalente"**, mas em modo incremental:
em vez de substituir tudo, ele calcula só o que ainda falta cobrir
(descontando o que já está selecionado do lado Agrocete) e deixa
adicionar produto por produto ou todos de uma vez — útil depois de já
ter ajustado manualmente e querer só complementar o que sobrou.

- É uma **heurística de aproximação por nutriente** (`suggestAgrocete.js`),
  não um solver exato nem uma recomendação agronômica validada — o
  próprio painel deixa esse aviso visível.
- A dose sugerida de cada produto é a que cobre o nutriente em que ele é
  mais "diluído" em relação ao que falta (o mais restritivo) — os
  outros nutrientes daquele produto, mais concentrados, tendem a sobrar
  além do necessário, o que é intencional (melhor sobrar do que faltar
  numa base rápida de manejo). Nutrientes que nenhum produto Agrocete do
  catálogo cobre o bastante (ex: Cálcio e Níquel, hoje ausentes de todo
  o portfólio) ficam sinalizados como "só concorrente" no comparativo, e
  o painel/botão avisam explicitamente quando isso acontece, em vez de
  não fazer nada.
- Reage em tempo real: ao adicionar uma sugestão (ou remover algo do
  manejo concorrente), a lista recalcula o que ainda falta.

## Manejos prontos por cultura

O painel "Manejos prontos" (barra lateral) carrega, com um toque, o
manejo Agrocete de Soja, Milho ou Algodão em 3 níveis de investimento:
**Básico**, **Médio** e **Completo**.

- **Fonte**: os produtos, estágios fenológicos e doses vêm do material
  oficial "Manejo Atualizado 2024" da própria Agrocete (fornecido pelo
  usuário) — não foram inventados nem pesquisados externamente.
- **Os 3 níveis são um agrupamento nosso**, não 3 níveis definidos
  oficialmente pela Agrocete: cada cultura tem uma sequência de
  estágios (ex. Soja: Plantio → V3-V5 → R1-R3 → R4-R5) e cada nível
  inclui um subconjunto crescente desses estágios. **Completo** = manejo
  integral do material oficial. Quando um produto se repete em mais de
  um estágio incluído (ex: EVIC-S na Soja aparece em R1-R3 e R4-R5), a
  dose carregada é a **soma da safra inteira**, não a de uma aplicação
  isolada.
- **Doses de tratamento de sementes (TS)** variam conforme a taxa de
  semeadura da cultivar — foi usada a dose de aplicação em **sulco**
  (já em L/ha ou kg/ha no material oficial) por não depender dessa
  variável; onde só havia faixa (ex: "0,4 a 1,2 L/ha"), foi usado o
  limite inferior. As notas de cada produto carregado (incluindo a
  dose de TS por kg de semente, quando existe) aparecem no aviso que
  some ao carregar o manejo.
- **Preços não estão incluídos** (entram como R$ 0,00) — adicione os
  preços reais de cada produto antes de gerar uma cotação.
- **Revise sempre com a equipe técnica antes de cotar**: os 3 níveis são
  um ponto de partida rápido, não uma recomendação agronômica fechada
  pra cada talhão.

## Manejos salvos (templates)

O botão "Manejos salvos" permite nomear e salvar a seleção atual
(produtos + doses + preços) como um template, pra recarregar rápido em
campo — útil pra manejos recorrentes tipo "Soja V4 vs. Stoller". Os
templates ficam no mesmo `localStorage` do resto do app; dá pra
renomear ou excluir a qualquer momento.

## Layout

Em telas largas (≥1080px) a tela é dividida em duas colunas de
proporção bem diferente: a **esquerda, compacta** (360px), só com
busca, filtros e a lista de produtos do catálogo; a **direita, grande**
(o resto da tela, fixa/`sticky`, acompanha a rolagem), com tudo relativo
a montar e comparar o manejo — manejos prontos, o **manejo atual lado a
lado** (Concorrentes | Agrocete, cada um na sua coluna), o botão
"Transformar em manejo Agrocete", manejos salvos e o comparativo
completo de nutrientes e custo. A ideia é que o catálogo (onde você só
navega/seleciona) ocupe pouco espaço, e a comparação (o que realmente
importa na cotação) fique grande e visível sem precisar rolar a página
inteira. Em telas estreitas essas duas colunas empilham (catálogo
primeiro), e o bottom sheet arrastável no rodapé (ver abaixo) cobre o
resumo rápido com menos espaço de tela.

## Chips de filtro rápido

Acima do catálogo, uma fileira de chips roláveis filtra o catálogo com
um toque: "Todos", "Somente Agrocete" (isola só o nosso portfólio),
os nutrientes mais buscados (Zinco, Boro, Cálcio, etc. — reaproveita a
busca por nutriente já existente) e as categorias com mais produtos.
Clicar num chip de nutriente ou categoria muda pra visão "Por marca" e
preenche a busca automaticamente.

## Interação pensada pro campo

- **Cards compactos**: sem seleção, o card tem só nome, categoria e o
  resumo das garantias — uma linha. Ao selecionar, ganha uma segunda
  linha compacta com dose ajustável por +/- e o preço; a edição
  completa (slider, passo fino, dose e preço lado a lado) abre num
  drawer ao tocar no ícone de lápis, sem lotar a lista de scroll.
- **Adicionar por swipe** (mobile): arraste um card do catálogo pra
  direita pra adicionar ao manejo com a dose padrão — complementa o
  toque no `+`.
- **Manejo atual**: lista sempre visível dos produtos selecionados —
  toque num item pra abrir o editor de dose/preço, arraste pra
  esquerda (touch) ou toque no X pra remover.
- **Busca instantânea** por nome, composição, categoria ou nutriente
  (ex: buscar "Zinco" encontra produtos com esse micronutriente).
- **Comparativo com cor fixa por identidade**: nas barras de nutriente,
  verde é sempre Agrocete e cinza é sempre o concorrente (não muda de
  cor conforme quem está na frente) — o lado à frente ganha um
  contorno sutil, e um selo compacto ("▲ +23%" ou "só Agrocete")
  aparece ao lado do nutriente quando a diferença é grande.
- **Bottom sheet arrastável** (estilo Google Maps, só em telas
  estreitas — no desktop a barra lateral já mostra tudo), fixo no
  rodapé, com o resumo do manejo — toque ou arraste pra expandir e ver
  os macros-chave (N, P, K, Ca, Mg) e o custo em tela cheia. Pulsa
  suavemente quando os dois lados (concorrente e Agrocete) já têm
  produto selecionado.
- **Alto contraste**: botão de sol/lua no cabeçalho alterna pra um
  fundo mais escuro e reforça o contraste dos textos secundários,
  pensado pra leitura sob sol forte.
- **Vibração tátil leve** (quando o navegador/aparelho suporta) ao
  selecionar ou remover um produto.

## Persistência

A seleção de produtos (doses e preços), os manejos salvos e o
cadastro de doses travadas (aba "Cadastro de doses") são gravados
automaticamente no `localStorage` do navegador a cada alteração, sob a
chave `agro-dashboard-state-v1`. Ao recarregar a página o estado é
restaurado. É armazenamento local por navegador/dispositivo — não
sincroniza entre aparelhos (use exportar/importar JSON no Cadastro de
doses pra levar entre dispositivos).

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

- Preencher e travar as doses pendentes na aba "Cadastro de doses"
  (954 produtos com nutrientes cadastrados ainda sem dose, a maioria
  vinda da planilha "Produtos Nutricionais") — e, depois de travadas,
  pedir pro Claude Code consolidar o JSON exportado direto em
  `products.js` como `defaultDose`/`doseRaw` permanentes, em vez de
  ficar só no `localStorage` de um dispositivo.
- Confirmar com a equipe técnica a divergência sinalizada no GRAP 140
  FLUID (ver `fonte` desse produto em `products.js`) — planilha nova
  sugere Enxofre 8%/Manganês 14%, mas a observação já cadastrada indica
  12%/7% como a formulação atual.
- Melhorar o casamento de nomes na matriz de equivalência (hoje só
  ~18% das referências de concorrentes batem com um produto
  catalogado) para aumentar a cobertura do comparativo automático.
- Adicionar abas de nutrientes para as marcas que só têm nome de
  produto na matriz de equivalência e ainda não têm dados reais
  (Ballagro, Lallemand, Genica, Koppert, Union Agro, Nitro, Gran7,
  Dimicron, Syngenta Biológicals), se houver dados/fichas técnicas
  disponíveis.
- Permitir exportar/importar a seleção como JSON, para compartilhar
  entre dispositivos sem depender só do `localStorage` (o Cadastro de
  doses já tem isso; falta pro resto da seleção/manejos).
- Modo "versus" com dois manejos nomeados de forma independente lado a
  lado (hoje o app já separa Agrocete x concorrente automaticamente
  pelos produtos selecionados, mas não permite nomear/salvar cada lado
  como um manejo distinto).
- Adicionar preços reais aos manejos prontos (`src/data/managementPresets.js`)
  assim que definidos, e trazer mais culturas além de Soja/Milho/Algodão
  se houver material oficial equivalente.
