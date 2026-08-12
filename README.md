# Painel Agrocete — Inteligência em nutrição foliar

Plataforma para comparar produtos, composições e manejos de nutrição
foliar por **composição, posicionamento e custo por hectare** — a partir
dos dados reais das planilhas internas e dos materiais oficiais, nunca de
dados inventados.

**Compare. Entenda. Decida melhor.**

## Como a plataforma está organizada

Três telas, acessíveis pela navegação do topo:

- **Início** — hero com a busca principal (produto, empresa, nutriente ou
  cultura), quatro atalhos de ação e os indicadores da plataforma, todos
  derivados dos dados reais (nenhum número é escrito à mão). A busca leva
  direto ao catálogo já filtrado.
- **Comparar** — comparação A vs B de dois produtos: visão geral,
  composição com a diferença calculada, economia (custo/ha, custo por kg
  de nutriente) e posicionamento por cultura/estádio.
- **Catálogo e manejo** — o dashboard completo que já existia, intacto:
  catálogo por categoria/marca, manejo atual lado a lado, manejos prontos
  por cultura, sugestão automática de manejo Agrocete equivalente,
  manejos salvos, trava de dose e exportação em PDF.

### O que os dados sustentam (e o que não sustentam)

Esta é a parte mais importante da plataforma: **cada número exibido tem
origem rastreável, e cada lacuna é sinalizada em vez de preenchida.**
Situação atual do catálogo (medida, não estimada):

| Dado | Cobertura |
| --- | --- |
| Nome, marca, categoria | 1518 / 1518 |
| Origem do dado (`fonte`) | 1518 / 1518 |
| Composição nutricional | 1084 / 1518 |
| Dose de referência | **248 / 1518** |
| Densidade | 737 / 1518 |
| Posicionamento por cultura/estádio | **16 / 1518** (só produtos Agrocete dos manejos oficiais de Soja, Milho e Algodão) |
| Preço | **0** — preço não está no catálogo, é sempre informado pelo usuário |

Consequências práticas, que a interface deixa explícitas:

- **Custo/ha depende de dose e preço.** Como só 16% dos produtos têm dose
  cadastrada e nenhum tem preço, o custo aparece como "informe dose e
  preço para calcular" em vez de "R$ 0,00" — um zero pareceria resultado.
- **Posicionamento por cultura/estádio existe para 16 produtos.** Nos
  demais a plataforma diz "sem posicionamento cadastrado", em vez de
  inferir cultura a partir da categoria.
- **Não existem campos de tecnologia, ensaio ou preço histórico** no
  catálogo — por isso não há filtro por tecnologia nem índice com
  evidência experimental (ver "O que ainda não existe").

### Confiabilidade dos dados

Todo produto carrega um selo derivado do campo `fonte`, clicável para ver
a origem registrada (`src/lib/provenance.js`):

- **✓ Planilha oficial** (308 produtos) — planilha interna Agrocete.
- **✓ Dado informado** (993) — planilhas enviadas pela equipe, sem
  conferência contra ficha técnica do fabricante.
- **⚠ Não verificado** (217) — produtos que entraram só como nome na
  matriz de equivalência, sem composição conferida.

Nenhum texto de fonte novo é promovido a "oficial" automaticamente: o que
não casa com uma origem conhecida cai em "informado".

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Senha padrão: `12345678` (veja "Tela de
senha" abaixo para trocar).

## O que ainda não existe (e por quê)

Estas funcionalidades foram pedidas mas **não foram implementadas porque o
dado que as sustenta não existe no catálogo** — implementá-las hoje
significaria inventar informação agronômica:

- **Filtro por tecnologia** (quelato, complexado, aminoácidos, fosfitos,
  carboxílicos): não há campo de tecnologia. Uma varredura no texto livre
  de composição/observações encontra menção a alguma dessas tecnologias em
  ~66 produtos (4% do catálogo) — insuficiente e não confiável para virar
  filtro. Precisa de um campo `technology` na planilha-fonte.
- **Filtro por cultura e por estádio de aplicação**: existe só para 16
  produtos (1%). Um filtro de cultura hoje esconderia 99% do catálogo.
- **Índice NCI (Nutrição & Custo Index)**: um dos critérios pedidos é
  "evidência experimental", e não há **nenhum** dado de ensaio cadastrado.
  Um índice que pondera um critério inexistente é um número com aparência
  de rigor e sem lastro.
- **Página de empresa com logo e descrição**: o catálogo tem só o nome da
  marca. O perfil por marca (nº de produtos, categorias, nutrientes) já
  está calculado em `src/lib/catalog.js` (`brandProfile`) e pode virar
  página assim que houver conteúdo institucional.
- **Preço por região/data/condição comercial**: a camada de cálculo já
  isola preço como entrada do usuário, mas não há histórico nem cadastro
  de preço para versionar.

Para destravar qualquer um desses itens, o caminho é o mesmo dos dados que
já entraram: uma planilha com as colunas correspondentes.

## Estrutura

### Plataforma (camadas novas)

- `src/App.jsx` — shell: navegação, tema (claro/escuro) e status de conexão.
- `src/theme.css` — design tokens (cores, raios, sombras, botões). Tema
  claro por padrão; o escuro continua no botão do cabeçalho porque é o que
  funciona sob sol forte em campo.
- `src/pages/Home.jsx` — hero, busca principal, atalhos e indicadores.
- `src/pages/Compare.jsx` — comparador A vs B.
- `src/lib/economics.js` — custo/ha, custo total por área, custo por kg de
  nutriente e diferenças. Documenta a regra de unidades (g/L para líquido,
  g/kg para sólido) e devolve `null` — não zero — quando falta entrada.
- `src/lib/provenance.js` — níveis de confiabilidade a partir do `fonte`.
- `src/lib/catalog.js` — índices derivados, estatísticas da plataforma,
  posicionamento por cultura/estádio e busca unificada.
- `src/components/` — `ProductSelector`, `DataBadge`, `CostPerHectare`,
  `CompareBars`.

### Catálogo e manejo (preservado)

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
  um produto, sem precisar expandir o card na lista. Tem também o botão
  de cadeado ("Travar") pra fixar a dose atual como padrão do produto
  nesse aparelho — ver "Travar dose" abaixo.
- `src/dashboard/CostEfficiency.jsx` — cálculo de R$/kg por nutriente
  entregue, insights automáticos, a barra de comparação compacta
  (`CompareBar`, cor fixa por identidade: verde = Agrocete, cinza =
  concorrente) e o selo `NutrientBadge` ("▲ +23%" / "só Agrocete").
- `src/dashboard.css` — micro-interações que inline styles não
  expressam: escala ao tocar, accordion com altura suave, pulso do
  bottom sheet, estilo do slider.
- `src/PasswordGate.jsx` — tela de senha antes de carregar o dashboard.
- `src/main.jsx` — ponto de entrada React.
- `src/data/products.js` — catálogo de 1518 produtos (Agrocete + 57
  marcas concorrentes), gerado a partir das planilhas internas e das
  planilhas/PDFs enviados pelo usuário ao longo do projeto.
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
- `src/dashboard/SearchAutocomplete.jsx` — busca com dropdown de
  autocompletar, ranking por relevância e navegação por teclado; deixa
  adicionar produto ao manejo direto do resultado.
- `src/dashboard/nutrientColors.js` — cor e abreviação fixas de cada
  nutriente, usadas no app inteiro.
- `src/dashboard/NutrientPill.jsx` — pill colorida de nutriente e a
  fileira de pills que aparece nos cards do catálogo.
- `src/dashboard/categoryGroups.js` — agrupa as várias grafias de
  categoria das planilhas em 5 filtros funcionais.
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

- **PLANILHA_DE_PRODUTOS_NUTRICIONAIS_1.xlsx** — planilha com 996 linhas
  (coluna EMPRESA + Produto + garantias %m/m + densidade) enviada pelo
  usuário, adicionou 966 produtos novos e 32 marcas novas ao catálogo
  (AGRICHEM, AGROLATINA, AGROPLANTA, AGRÁRIA, AJINOMOTO, ALLTECH,
  ALTAGRO, AMINOAGRO, BIOLCHIM, BIOSOJA, BMS, BRASILQUÍMICA, COMPASS
  MINERALS, COMPO, DEFENSIVE, FERTILIZANTES HERINGER, INTERCUF,
  KIMBERLIT, MICROFOL, MICROQUÍMICA, MULTITÉCNICA, NUTRIPLANT,
  OXIQUÍMICA, QUIMIFOL, SAMARITÁ, SIPCAM-NICHINO, STOLLER, TRADECORP,
  UNISOLO, UPL, VALAGRO, YARA), usando a mesma conversão %m/m → g/L
  (líquidos, com densidade) ou ×10 → g/kg (sólidos) das planilhas
  anteriores. A seção "GRAP AGROCETE" da planilha (produtos da própria
  Agrocete, disfarçados como se fossem de outra empresa) foi tratada à
  parte: 19 nomes que já batiam exatamente com um produto Agrocete
  existente foram ignorados (evitar duplicata) e só os genuinamente
  novos entraram. Um produto já cadastrado sem dados nutricionais
  (Ubyfol KYMON) teve a garantia real encontrada nessa planilha e foi
  atualizado em vez de duplicado.
- **Aminoácidos, substâncias húmicas e silício**, quando presentes na
  planilha acima, não entraram em `nutrients` (não são macro/micronutriente
  no mesmo sentido dos demais) — ficaram registrados como texto em
  `observations` de cada produto, pra não perder a informação.

**Limitações conhecidas dos dados** (herdadas das planilhas-fonte, não
"corrigidas" para não inventar informação):
- Doses (`defaultDose`) são estimadas a partir do primeiro número
  encontrado no texto de dose da planilha — ponto de partida, não
  recomendação agronômica. Ajuste sempre conforme a bula.
- Das ~272 referências de produtos concorrentes na matriz de
  equivalência, ~50 têm dados nutricionais reais cadastrados (das
  planilhas de nutrientes, Biochim e Ubyfol); as outras ~218 estão no
  catálogo com nome, marca e categoria, mas sem concentração — ver
  "218 produtos 'só nome'" acima.
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
livremente entre as 11 marcas mapeadas (ex: um produto da Vittia + um
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

## Fluxo em 3 passos

A tela é numerada pra deixar explícito o caminho que o consultor percorre:

1. **Ache o produto concorrente** — busca com autocompletar (mostra os
   produtos enquanto digita, com marca e categoria, e deixa adicionar ao
   manejo direto pelo dropdown, sem abrir a marca na lista), mais filtro
   por marca e chips de categoria.
2. **Ajuste a dose e trave se quiser** — o "Manejo atual" lista o que já
   está selecionado; tocar num item abre o editor de dose/preço com o
   botão de travar (ver "Travar dose" abaixo).
3. **Compare com a Agrocete** — comparativo de nutrientes com a variação
   (Δ) de cada um, sugestão automática de manejo equivalente,
   custo-benefício e exportação em PDF.

## Barra de status

O cabeçalho mostra, sempre visível: total de produtos catalogados, marcas
concorrentes, quantas doses estão travadas neste aparelho, e um indicador
de **conexão**. O indicador existe pra dar segurança em campo: o app
funciona 100% sem sinal (todo o catálogo está embutido), então quando cai
a internet ele mostra "Offline — funciona normal" em vez de deixar o
consultor achando que o app quebrou.

## Filtros do catálogo

Três filtros que se combinam (busca **e** marca **e** categoria):

- **Busca com autocompletar** — por nome, marca, composição, categoria ou
  nutriente. O ranking coloca quem começa com o termo na frente, e produto
  Agrocete desempata pra cima. Navega por ↑/↓/Enter no teclado.
- **Filtro por marca** — seletor com as 58 marcas; escolher uma isola só
  o portfólio dela.
- **Chips de categoria** — Nutrição, Solo, Trat. de sementes, Biológicos
  e Adjuvantes/Tec. aplicação. Esses chips filtram de verdade pelo campo
  `category` (não preenchem a busca), e cada grupo junta todas as grafias
  que as planilhas usam pra mesma coisa ("Nutrição e Fisiologia" e
  "NUTRIÇÃO E FISIOLOGIA", "Biocontrole" e "BIOCONTROLE", etc.) — sem
  isso, filtrar pela string crua deixaria metade dos produtos de fora.
  Ver `src/dashboard/categoryGroups.js`.

Não existe um grupo "Foliar" de propósito: a categoria dominante das
planilhas é "Nutrição e Fisiologia", que mistura foliar e solo sem
distinguir — separar isso seria inventar uma classificação agronômica que
o dado de origem não tem. Dois produtos ("Acaricida e Fungicida" da
Vittia) ficam fora de todos os grupos por não serem nutrição; continuam
acessíveis pela busca e pela visão por marca.

## Cores por nutriente

Cada nutriente tem uma cor fixa em todo o app (`src/dashboard/nutrientColors.js`):
verde = Nitrogênio, azul = Fósforo, laranja = Potássio, turquesa = Zinco,
e assim por diante. As garantias de cada produto aparecem como **pills
coloridas** no card em vez de texto corrido, então dá pra bater o olho e
ver "tem N, tem Zn" sem ler. Nos cards selecionados (que assumem a cor da
marca no fundo) as pills ganham fundo escuro sólido, pra cor do nutriente
continuar legível.

No comparativo, cada nutriente mostra a variação **Δ** entre os dois
manejos — sempre visível, com o percentual exato (Δ ▲ +23%), "≈" quando
a diferença é menor que 5% (empate técnico), ou "só Agrocete" / "falta na
Agrocete" quando só um dos lados entrega aquele nutriente.

## Uso no celular (mobile first)

- **Alvos de toque de 48×48px** nos controles mais usados: stepper de
  dose (+/−), botão de travar, fechar e concluir do editor. O campo de
  dose também ficou grande (fonte 20px, `inputMode="decimal"` pra abrir
  o teclado numérico).
- **Barra fixa no rodapé** com o resumo do manejo e um botão **PDF**
  sempre alcançável assim que houver produto selecionado — sem precisar
  expandir o resumo nem rolar até o fim do comparativo.
- **Alto contraste** (botão de sol/lua no cabeçalho) pra leitura sob sol
  forte, reforçando o contraste dos textos secundários.

## Travar dose

Muitos produtos do catálogo (principalmente os importados de planilhas
de concorrentes) não vêm com uma dose de referência cadastrada — o
comparativo abre com dose `0` pra eles. No drawer de edição (ícone de
lápis no card selecionado) tem um botão de cadeado **"Travar"** ao lado
do campo de dose: ele fixa a dose que está no campo naquele momento
como o novo padrão daquele produto **nesse aparelho**. Da próxima vez
que o produto for selecionado (mesmo depois de remover e adicionar de
novo, ou de recarregar a página), ele já entra com a dose travada em
vez de `0`. O cadeado destrava a qualquer momento pra voltar a editar
livremente. Assim como o resto da persistência do app, é um valor local
por navegador/dispositivo (`localStorage`, chave `doseOverrides` dentro
de `agro-dashboard-state-v1`) — não é compartilhado entre aparelhos ou
usuários diferentes, e não sobrescreve a dose oficial de nenhuma planilha.

## Persistência

A seleção de produtos (doses e preços), os manejos salvos, as doses
travadas e o nome do cliente/fazenda são gravados automaticamente no
`localStorage` do navegador a cada alteração, sob a chave
`agro-dashboard-state-v1`. Ao recarregar a página o estado é restaurado.
É armazenamento local por navegador/dispositivo — não sincroniza entre
aparelhos nem entre membros da equipe.

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

Logo acima do botão há um campo **Cliente / fazenda**: o que for digitado
ali entra no cabeçalho do PDF, abaixo do título, e também vira o nome do
arquivo (`comparativo-agrocete-fazenda-boa-vista.pdf`), pra várias
propostas não virarem "(1)", "(2)" na pasta de downloads. O nome fica
salvo junto com o resto do estado, então continua preenchido na próxima
visita.

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
- Modo "versus" com dois manejos nomeados de forma independente lado a
  lado (hoje o app já separa Agrocete x concorrente automaticamente
  pelos produtos selecionados, mas não permite nomear/salvar cada lado
  como um manejo distinto).
- Adicionar preços reais aos manejos prontos (`src/data/managementPresets.js`)
  assim que definidos, e trazer mais culturas além de Soja/Milho/Algodão
  se houver material oficial equivalente.
