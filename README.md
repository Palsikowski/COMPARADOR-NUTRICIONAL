# Painel Agrocete — Inteligência em nutrição foliar

Plataforma para comparar produtos, composições e manejos de nutrição
foliar por **composição, posicionamento e custo por hectare** — a partir
dos dados reais das planilhas internas e dos materiais oficiais, nunca de
dados inventados.

**Compare. Entenda. Decida melhor.**

## Como a plataforma está organizada

A navegação do topo tem cinco entradas, além da home:

- **Início** — hero com a busca principal (produto, empresa, nutriente,
  cultura ou estádio fenológico), quatro atalhos de ação, os indicadores
  da base e o módulo **Preço ≠ valor**. Todos os números são derivados dos
  dados reais; nenhum é escrito à mão.
- **Produtos** — catálogo completo por categoria. É também para onde a
  busca da home leva, já filtrada.
- **Empresas** — vitrine com uma **bandeira por empresa** (61). Abrir uma
  bandeira leva ao portfólio dela, onde dá para marcar produtos, ver o
  **gráfico comparativo** e baixar o **PDF** para discutir com a equipe.
- **Manejos** — catálogo com os manejos oficiais por cultura e estádio já
  abertos.
- **Calculadora Custo/ha** — comparação A vs B: visão geral, composição
  com diferença calculada, economia (custo/ha por área, custo por kg de
  nutriente), índice NCI e posicionamento.
- **Sobre** — metodologia aberta: cobertura medida dos dados, níveis de
  confiabilidade, as fórmulas usadas, os pesos do NCI, as tabelas de
  referência (interações entre nutrientes e sais/matérias-primas) e os limites
  conhecidos.

Produtos e Manejos são duas entradas para o mesmo dashboard que já existia —
ele continua intacto, com manejo atual lado a lado, manejos prontos, sugestão
automática de manejo Agrocete, manejos salvos, trava de dose e exportação em
PDF. Empresas deixou de ser uma terceira entrada nele e ganhou tela própria.

## Catálogo em grade (Produtos)

A navegação do catálogo é uma **grade virtualizada** sobre os 1.647 produtos,
com barra de filtros fixa no topo.

- **Colunas:** 4 (≥1240px), 3 (≥940px), 2 (≥640px), 1 no celular.
- **Duas visões:** grade (cards) e **lista compacta** para varredura rápida.
  No celular abre em lista por padrão; o alternador fica na barra de filtros.
- **Filtros combinados:** busca, empresa (seletor), grupos de categoria e
  nutriente (chips deslizantes). Ordenação por Categorias ou Marcas.
- **Card:** empresa (badge), nome, categoria, composição com **unidade
  explícita** (g/L ou g/kg), selos, botão "Adicionar" (vira "Selecionado") e
  botão de **ficha técnica**. Na barra também há atalho para escanear rótulo.
- **Ficha técnica:** composição completa com %m/m ao lado, dose de referência,
  posicionamento oficial quando existe, observações, alertas e a origem do
  dado. Campo sem informação aparece como "não informado" — a ausência também
  é informação na hora de cotar.
- **Seleção compartilhada:** marcar um produto na grade alimenta a mesma
  seleção da aba **Meu manejo** (mesmo `localStorage`), então dá pra montar o
  manejo navegando e ir direto ao comparativo pela barra inferior.

### Editar a composição manualmente

Na ficha técnica, a seção **Composição declarada** tem o botão **Editar**:
apresentação (líquido/sólido), densidade, uma linha por nutriente
(adicionar/remover) e um campo de motivo. A concentração é digitada na mesma
unidade que o app usa nas contas (g/L ou g/kg) — pedir %m/m obrigaria a
converter de cabeça, que é onde o erro entra; o %m/m é recalculado sozinho
quando há densidade.

Três garantias:

- **O catálogo publicado nunca é sobrescrito.** A edição é uma camada por cima,
  guardada no aparelho, e o produto passa a exibir "editado por você". O botão
  **Voltar ao original do catálogo** restaura os valores publicados a qualquer
  momento, e a tela de edição mostra os valores originais para conferência.
- **A edição vale no app inteiro**, não só na ficha: grade, comparativo, custo
  por nutriente, NCI, caderno e sugestão de manejo passam a usar o valor novo.
  Se valesse só na ficha, o comparativo continuaria com o número velho — que é
  exatamente o erro que essa função existe para evitar.
- **É por aparelho** (`localStorage`), como o resto das preferências — não
  sincroniza entre pessoas.

Implementação em `src/lib/overrides.js`. Para garantir que todo consumidor
enxergue o mesmo valor sem depender de lembrar de passar o override em cada
tela, os overrides são aplicados ao objeto do produto uma única vez, antes do
primeiro render (`main.jsx`), com o estado original preservado em memória para
o desfazer.

### Virtualização

Renderizar 1.647 cards de uma vez trava celular, então só as linhas visíveis
(mais uma margem) vão ao DOM — medido: **52 cards no DOM**, constante ao
rolar. Não foi usada biblioteca: a janela é calculada a partir do scroll
(`useWindowed` em `src/pages/Catalog.jsx`).

Para a conta fechar, a altura da linha é **fixa** (`grid-auto-rows: 220px` +
12px de gap = passo de 232px, o mesmo valor no JS). Linha elástica faria o
espaçador derivar e a rolagem "pular" — verificado que o passo real é
exatamente 232px e que o último produto renderiza ao fim da lista.

### Sobre Tailwind

O pedido mencionava Tailwind. O projeto **não usa Tailwind** e não foi migrado:
os tokens em `src/theme.css` já implementam a paleta pedida (`#F9FAFB`,
`#FFFFFF`, bordas `#E5E7EB` de 1px, raio 12px, verde `#059669`, transições de
200ms). Trocar a stack traria risco sem ganho visual — a orientação anterior
do próprio briefing era não migrar de stack só por estética.

## Manejos Agrocete

Aba própria com o posicionamento por cultura e estádio, direto dos materiais
oficiais. Hoje são **5 manejos**:

| Manejo | Etapas | Fonte |
| --- | --- | --- |
| Soja | 4 | SOJA — Manejo Atualizado 2024 |
| Milho | 3 | MILHO — Manejo Atualizado 2024 |
| Algodão | 6 | ALGODÃO — Manejo Atualizado 2024 |
| **Sorgo** | 6 | POSICIONAMENTO SORGO (pág. 1) |
| **Milho (posicionamento 2024)** | 5 | POSICIONAMENTO SORGO (pág. 2) |

Os dois últimos entraram a partir dos PDFs oficiais enviados pelo usuário. O
**Sorgo** é cultura nova no app. O **Milho (posicionamento 2024)** difere do
manejo "Milho" já cadastrado (posiciona Nitro + Grap 104 Fluid em V3–V4 e
V7–V10, onde o outro usa Organo TOP + EVIC-S) — os dois foram mantidos, cada
um com sua fonte, porque não dá pra saber pelos arquivos qual é o mais
recente. A equipe decide qual usar e pode excluir o outro.

As doses e os estádios foram lidos das páginas renderizadas dos PDFs (são
infográficos: a extração de texto embaralha as colunas, então a leitura foi
visual, página a página).

### Editar manejos

Os manejos oficiais são **somente leitura** — são a referência publicada pela
Agrocete. "Editar" cria uma **cópia sua**, guardada no aparelho; o oficial
continua intacto. Nas cópias dá para renomear, adicionar/remover/reordenar
etapas, adicionar produtos do catálogo, mudar dose e escrever a observação que
sai no caderno. Também dá para criar um manejo do zero.

### Caderno de manejo (PDF)

De qualquer manejo sai um **caderno para apresentar ao cliente**: capa com o
nome do manejo, cliente/fazenda e a fonte; uma seção por etapa; e, para cada
produto, a garantia nutricional, a observação de dose, as observações do
cadastro e os alertas. Fecha com o total por produto na safra.

O texto de cada produto vem do catálogo — produto sem descrição cadastrada
aparece dizendo isso, em vez de receber um texto comercial genérico. Quando há
preços informados, o caderno traz o custo/ha e avisa quantos produtos ficaram
de fora da conta por não terem preço.

## Empresas: bandeiras, gráfico e PDF

A entrada **Empresas** era o mesmo catálogo agrupado por marca: para chegar a
uma empresa específica era preciso rolar os 1.647 produtos. Agora é uma vitrine
de bandeiras — 61 blocos, um por empresa, com o tamanho do portfólio e quanto
dele tem composição cadastrada. Buscar por nome filtra a vitrine.

**A bandeira não é o logotipo da empresa.** O catálogo não tem logotipo de
ninguém: as planilhas trazem só o nome. Desenhar algo parecido com a marca de
terceiros seria inventar identidade visual, então a bandeira é um bloco com a
inicial e uma cor derivada do próprio nome — determinística, para a mesma
empresa ter sempre a mesma cor, e com saturação fixa, para nenhuma empresa
ganhar destaque por acaso.

### Dentro da empresa

O portfólio abre com os produtos que têm composição primeiro (são os que viram
gráfico). Marcando de 2 a 4 produtos, o comparativo aparece na hora.

**O teto de 4 não é técnico:** acima de quatro cores as barras deixam de ser
distinguíveis com segurança por quem tem daltonismo. Gerar uma quinta cor
resolveria na tela e quebraria a leitura, então a seleção trava em quatro.

A seleção **não** mexe no "Meu manejo": aqui a pessoa está estudando o
portfólio de um concorrente para discutir com a equipe, não montando um manejo
para cotar. Misturar os dois faria a seleção de estudo virar recomendação sem
ninguém pedir.

### O gráfico

Barra horizontal agrupada: um bloco por nutriente, uma barra por produto. A
série é o produto (identidade), então a paleta é categórica — quatro matizes
validadas para daltonismo contra o fundo claro **e** contra o escuro, com o
`validate_palette` do próprio método, não no olho.

Três decisões que mudam o que o gráfico diz:

- **Nutriente não declarado sai como traço (—), nunca como zero.** Barra zerada
  leria como "não entrega"; o certo é "não sabemos".
- **Produto sem composição não entra no gráfico** — sai listado abaixo dele,
  com o nome, para a ausência ficar à vista em vez de sumir.
- **g/L, g/kg e %m/m não dividem eixo.** Um é por litro, o outro por quilo e o
  terceiro é proporção. Quando a seleção mistura, sai **um gráfico por
  unidade**, cada um com sua escala, e um aviso de que comparar as alturas
  entre eles não significa nada. O painel de **%m/m** existe para os produtos
  que vieram sem densidade no material de origem: comparar a proporção
  declarada entre eles é legítimo, e a tela avisa que isso não é entrega por
  hectare.
- **A cor identifica o produto, não a posição no gráfico.** Com a seleção
  dividida em mais de um painel, colorir por posição daria a mesma cor a dois
  produtos diferentes na mesma tela.

Todo valor é rotulado direto na barra e existe **visão de tabela** no mesmo
lugar: dois dos quatro tons ficam abaixo de 3:1 de contraste sobre o fundo
claro, o que obriga a leitura a não depender só da cor.

### O PDF

O botão **Baixar PDF** gera capa com o nome da empresa, a observação que a
equipe escreveu, o gráfico, a tabela com os mesmos números e a lista do que
ficou de fora por falta de composição. O gráfico é **redesenhado vetorialmente**
no PDF em vez de virar print da tela: assim não borra ao ampliar nem ao
imprimir, e sai sempre na paleta clara — papel é sempre claro, independente do
tema que estava aberto. O cabeçalho da tabela se repete quando ela vira a
página.

## Dose por cultura (Soja, Milho, Feijão)

O material de posicionamento oficial da Agrocete traz a dose de cada produto
por cultura. Isso virou o campo `culturas` e uma seção própria na ficha —
**31 produtos**, contra os 16 que tinham posicionamento por estádio.

- **Cultura sem dose no material não aparece.** O GRAP GRAD, por exemplo, tem
  dose para Soja e Feijão e um traço no Milho: a ficha mostra duas culturas,
  não três com uma vazia.
- **Feijão é cultura nova no app** e não tem manejo montado. Sem juntar as
  duas origens de cultura (manejos prontos + dose por cultura dos produtos),
  buscar "feijão" na home não ofereceria nada, mesmo com 31 produtos
  posicionados para ela — então `CULTURES` agora é a união das duas.
- **A busca do catálogo acha por cultura e por tecnologia**, além de nome,
  marca, composição e categoria.

É diferente do **Posicionamento oficial**, que continua vindo dos manejos e
carrega o estádio fenológico. Dose por cultura é o teto e o piso da faixa;
posicionamento diz *quando* aplicar.

## Interações entre nutrientes

O que se soma e o que compete entre nutrientes. **21 interações** transcritas do
material de **Daniele Lorenzon (@daniglorenzon)**, 28/07/2026, em
`src/data/nutrientInteractions.js`.

A informação aparece em três lugares, do mais específico ao mais geral:

1. **Na ficha do produto** — só os pares que estão na composição **daquele
   produto**. Um produto com Zn e Cu mostra o antagonismo entre os dois;
   produto sem par nenhum não mostra seção. Nada de listar antagonismo com
   nutriente que o produto não tem, que seria alarme falso.
2. **No comparativo da empresa** — os pares em que um nutriente vem de um
   produto e o outro vem de **outro** produto da seleção. É o caso que
   interessa quando os dois entrariam juntos. Pares que já aparecem dentro de
   um mesmo produto ficam de fora daqui, para não repetir. Sai também no PDF.
3. **Em Sobre → Interações entre nutrientes** — a tabela completa, com filtro
   por tipo (sinérgica / antagônica / complexa) e por nutriente.

Três cuidados, porque isto é material de terceiro sobre fisiologia geral:

- **A autoria aparece junto de toda lista**, na tela e no PDF, com a ressalva
  de que é referência de fisiologia — não avaliação de produto, não medição da
  Agrocete e não recomendação de mistura em calda.
- **Não entra em nenhum cálculo.** NCI, custo, dose e comparativo continuam
  exatamente como estavam. É informação de leitura.
- **O tipo tem cor e ícone**, nunca só cor: "sinérgica" e "antagônica" mudam a
  decisão e não podem depender de o consultor distinguir verde de laranja.

A tabela de origem usa "P" e "K" (elemento) e o catálogo usa P2O5 e K2O
(óxido); o cruzamento é feito pelas chaves do catálogo. Alumínio está na tabela
por ser fator de solo, mas nenhum produto do catálogo declara Al — então esse
par só aparece na consulta geral.

## Identificar por foto

Fotografe o rótulo: o app lê o texto impresso e procura no catálogo.

- **É leitura de texto (OCR), não reconhecimento visual da embalagem.** Não
  existe nenhuma foto de produto cadastrada na base, então não há como treinar
  reconhecimento por aparência. O que dá para ler com segurança é o nome
  impresso, e casá-lo com os 1.647 nomes do catálogo.
- **Roda no aparelho.** O leitor (worker, núcleo WebAssembly e modelo de
  idioma, ~14 MB em `public/ocr/`) é servido pelo próprio app, não por CDN —
  sem isso a função só funcionaria com internet, o oposto do que o campo
  exige. É baixado uma vez e fica no cache do navegador. **A foto não é
  enviada para lugar nenhum.**
- **O app nunca decide sozinho.** O resultado é uma lista de candidatos com
  percentual e rótulo de confiança ("correspondência forte/provável/fraca");
  quem confirma é a pessoa.
- **O casamento é tolerante a erro de leitura, mas não a ponto de chutar**
  (`src/lib/photoMatch.js`): exige uma âncora — um token exato de 4+ letras ou
  o nome inteiro no texto lido. Sem isso não devolve nada, em vez de sugerir
  um produto errado com ar de certeza.
- **Quando a marca é lida e o nome não, a tela oferece o portfólio da marca.**
  É o caso de falha mais comum: o logo da empresa tem fonte limpa e o nome do
  produto é estilizado e curvo. Antes disso a resposta era só "nenhum produto
  reconhecido", e a pessoa recomeçava do zero com meia identificação na mão.
- **Empate no percentual é desempatado pela marca lida na mesma foto**, depois
  pelo nome completo. Sem isso o "Cálcio" genérico de qualquer empresa
  empatava em 100% com o "Grap Cálcio" que a foto realmente mostrava, e a
  ordem alfabética decidia.

### Segmentação de página: o que fazia a leitura falhar

O Tesseract usa por padrão o modo **PSM 6 ("um bloco uniforme de texto")**, que
num rótulo descarta justamente o nome do produto: ele é grande, isolado e fica
em faixa própria, então não pertence ao bloco de texto corrido. O resultado era
o app ler "AGROCETE / FERTILIZANTE MINERAL MISTO / CONTEÚDO LÍQUIDO: 20 L" e
**não** ler "GRAP CÁLCIO" — texto lido, produto não encontrado.

O app agora força **PSM AUTO** (análise de layout de verdade) e, só quando a
primeira leitura não casa com nada, repete em **SPARSE_TEXT**, que não assume
estrutura de página nenhuma e pega texto espalhado. A segunda passada fica fora
do caminho comum porque dobra o tempo.

Antes da leitura a foto é **reduzida para 1600px no lado maior**. Foto de
celular vem com 3000–4000px, o que o Tesseract não aproveita (ele trabalha na
faixa de 300 DPI de texto) e custa dezenas de segundos justamente no aparelho,
que é onde isso roda.

**Limitação conhecida:** no arquivo único offline (`build:standalone`) essa
função não opera, porque os arquivos do leitor não podem ser embutidos no
HTML. Na versão publicada ela funciona normalmente, inclusive depois offline.

### Busca por estádio fenológico

Buscar `V4` encontra os estádios cujo intervalo contém V4 (Soja `V3–V5` e
Milho `V3–V5/V6`), porque o casamento é por faixa e não por texto: o
rótulo é quebrado em tokens (`V3`, `V5`, `V6`) e o termo é testado dentro
do intervalo. Ver `stagesMatching` em `src/lib/catalog.js`.

### NCI — Nutrição & Custo Index

Índice **comparativo do par selecionado**: cada critério é normalizado
contra o outro produto (o melhor do par recebe 100). O mesmo produto tem
NCI diferente conforme com quem é comparado — fora de um par, o número não
significa nada. Não é nota de qualidade nem indicação de compra.

Critérios e pesos (`src/lib/nci.js`): custo por kg de nutriente (30%),
custo/ha (25%), nutriente entregue por hectare (25%), amplitude de
nutrientes (10%), posicionamento cadastrado (10%).

**O que fica fora, por falta de dado** — declarado na interface e no modal
"Como calculamos?":

- *Tecnologia de formulação* — não existe campo; só ~4% dos produtos citam
  algo em texto livre.
- *Evidência experimental* — não há nenhum ensaio cadastrado.

Critério sem dado nos dois produtos é excluído e os pesos restantes são
renormalizados; a tela informa quanto do peso total foi efetivamente
aplicado. Sem composição, dose ou preço dos dois lados, o índice não é
calculado: aparece **"Dados insuficientes para avaliação completa"** com
o motivo de cada lacuna.

### O que os dados sustentam (e o que não sustentam)

Esta é a parte mais importante da plataforma: **cada número exibido tem
origem rastreável, e cada lacuna é sinalizada em vez de preenchida.**
Situação atual do catálogo (medida, não estimada):

| Dado | Cobertura |
| --- | --- |
| Nome, marca, categoria | 1647 / 1647 |
| Origem do dado (`fonte`) | 1647 / 1647 |
| Composição convertida (g/L ou g/kg) | 1129 / 1647 |
| Composição só em %m/m (sem densidade) | 73 / 1647 |
| Dose de referência | **293 / 1647** |
| Densidade | 762 / 1647 |
| Dose por cultura (Soja/Milho/Feijão) | **31 / 1647** (produtos Agrocete do material de posicionamento) |
| Posicionamento por cultura/estádio | **16 / 1647** (só produtos Agrocete dos manejos oficiais de Soja, Milho, Algodão e Sorgo) |
| Preço | **0** — preço não está no catálogo, é sempre informado pelo usuário |

Consequências práticas, que a interface deixa explícitas:

- **Custo/ha depende de dose e preço.** Como só 16% dos produtos têm dose
  cadastrada e nenhum tem preço, o custo aparece como "informe dose e
  preço para calcular" em vez de "R$ 0,00" — um zero pareceria resultado.
- **Posicionamento por cultura/estádio existe para 16 produtos.** Nos
  demais a plataforma diz "sem posicionamento cadastrado", em vez de
  inferir cultura a partir da categoria.
- **Tecnologia, ensaio e preço histórico ainda não cobrem o catálogo.**
  As planilhas BRANDT/Bience/Microxisto/ICL trouxeram `technology` para 30
  produtos e `evidence` para 10 — o suficiente para exibir na ficha técnica,
  longe do suficiente para virar filtro ou entrar no índice (ver "O que ainda
  não existe").

### Confiabilidade dos dados

Todo produto carrega um selo derivado do campo `fonte`, clicável para ver
a origem registrada (`src/lib/provenance.js`):

- **✓ Planilha oficial** (308 produtos) — planilha interna Agrocete.
- **✓ Dado informado** (1119) — planilhas enviadas pela equipe, sem
  conferência contra ficha técnica do fabricante.
- **⚠ Não verificado** (199) — produtos que entraram só como nome na
  matriz de equivalência, sem composição conferida. Eram 217: o portfólio
  Gran7 preencheu 18 deles.

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
  carboxílicos): o campo `technology` agora existe, mas está preenchido em
  **30 de 1595 produtos** (2%), vindo só das quatro planilhas mais recentes.
  Um filtro por tecnologia hoje esconderia 98% do catálogo, então ele
  aparece apenas na ficha técnica de quem tem o dado. Vira filtro quando a
  coluna existir nas planilhas-fonte das demais marcas.
- **Filtro por cultura e por estádio de aplicação**: existe só para 16
  produtos (1%). Um filtro de cultura hoje esconderia 99% do catálogo.
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
- `src/pages/Home.jsx` — hero, busca principal, atalhos, indicadores e o
  módulo Preço ≠ valor.
- `src/pages/Compare.jsx` — comparador A vs B.
- `src/pages/About.jsx` — metodologia, cobertura dos dados e limites.
- `src/lib/nci.js` — cálculo do NCI, com os critérios ausentes declarados
  em `MISSING_CRITERIA`.
- `src/components/NciPanel.jsx` — NCI na tela e o modal "Como calculamos?".
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
- `src/PasswordGate.jsx` — a regra de acesso: valida a senha e guarda o
  desbloqueio. O desenho da tela é do `SignInPage`.
- `src/components/SignInPage.jsx` + `src/signin.css` — a tela de entrada
  (formulário, foto e os números reais da base).
- `src/lib/theme.js` — tema claro/escuro num lugar só, aplicado no boot pra a
  tela de entrada já nascer no tema certo.
- `src/main.jsx` — ponto de entrada React.
- `src/data/nutrientInteractions.js` — as 21 interações entre nutrientes e o
  cruzamento com a composição declarada de cada produto.
- `src/data/rawMaterials.js` — sais e matérias-primas (solubilidade e garantia
  declarada), tabela de referência exibida na página Sobre. Não são produtos do
  catálogo e não entram em nenhum cálculo.
- `src/components/InteractionList.jsx` — a lista de interações, no mesmo
  formato em todas as telas.
- `src/pages/Brands.jsx` — vitrine de bandeiras das 61 empresas.
- `src/pages/BrandPage.jsx` — portfólio de uma empresa, seleção de até 4
  produtos, comparativo e exportação.
- `src/components/ComparisonChart.jsx` — o gráfico (SVG) com visão de tabela.
- `src/lib/brandTiles.js` — dados das bandeiras e preparo do comparativo
  (separação por unidade, produtos sem composição).
- `src/lib/comparisonPdf.js` — PDF do comparativo, com o gráfico redesenhado
  em vetor.
- `src/lib/nutrientLabels.js` — nome por extenso de cada nutriente, num lugar
  só (estava repetido em quatro telas, com divergências entre elas).
- `src/data/products.js` — catálogo de 1647 produtos (Agrocete + 60
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

- **BRANDT, Bience, Microxisto e ICL 2023** — quatro planilhas enviadas
  pelo usuário, que trouxeram **77 produtos novos**, **3 marcas novas**
  (BRANDT, BIENCE, MICROXISTO) e **14 enriquecimentos** de produtos ICL que
  já estavam no catálogo:

  | Planilha | Produtos | Com concentração |
  | --- | --- | --- |
  | Portfólio comercial BRANDT | 27 | 15 |
  | Catálogo Bience Digital | 23 | 3 |
  | Operação X (Microxisto) | 11 | 9 |
  | Portfólio de Produtos ICL 2023 | 16 novos + 14 enriquecidos | 34 (marca toda) |

  Regras seguidas na importação, todas iguais às das planilhas anteriores:

  - **Conversão de garantia** — a mesma de sempre: `%m/m × densidade × 10`
    → g/L (líquido) ou `%m/m × 10` → g/kg (sólido). Quando a planilha trazia
    **os dois** valores (`% (g/L)`), a densidade foi *derivada* do par e só
    aceita se todas as leituras do produto concordassem entre si (tolerância
    de 0,05); discordando, a densidade fica em branco em vez de ser chutada.
  - **Produto sem densidade e sem g/L** (9 casos, ex.: BRANDT MaxEdge DC)
    entra com a composição **em % apenas**, exibida como percentual na ficha
    com um aviso explícito de que não dá para calcular custo por kg de
    nutriente sem a densidade. Não foi assumida densidade 1,0.
  - **Garantias combinadas** ("B/Cu 0,1", "Mn+Cu 1,5%", "Co, Mo, Ni, Zn, S,
    Mg") não foram divididas entre os nutrientes — iriam virar número
    inventado. Ficaram como texto em `observations`.
  - **Enriquecimento, não sobrescrita** — os 14 produtos ICL que já existiam
    receberam apenas os **campos novos**; nenhuma garantia numérica já
    conferida foi trocada. Onde as duas fontes divergem (PROFOL
    Produtividade: Cu 5 na base × 3 no material novo; B 15 × 18), **manteve-se
    o valor da base interna** e a divergência está escrita nas observações do
    produto, visível na ficha técnica.
  - **Cloro (`Cl`)** virou nutriente de primeira classe (cor e rótulo
    próprios) porque aparece declarado nessas planilhas — antes seria
    descartado.
  - **"P" e "K" nos materiais ICL** foram interpretados como **P2O5/K2O**
    (convenção de rótulo no Brasil). Isso está anotado nas observações dos
    produtos afetados para conferência contra a ficha técnica do fabricante.

- **Portfólio Gran7** — planilha com as 48 linhas do portfólio da marca. Foi
  a primeira que chegou depois de a GRAN7 já existir no catálogo **só com
  nomes**: os 21 produtos dela vinham da matriz de equivalência, sem nenhuma
  composição. Resultado: **30 produtos novos e 19 registros enriquecidos**,
  e a marca saiu de 0 para 38 produtos com composição declarada.

  - **Sem densidade em nenhuma linha.** Os 5 produtos sólidos (dose em kg/ha
    ou g/ha) convertem normalmente por `%m/m × 10 → g/kg`. Os líquidos não
    têm como virar g/L, então entram **só com o percentual** e a ficha diz
    isso. Para destravá-los basta informar a densidade pelo botão **Editar**
    da ficha — aí eles passam a entrar em custo por kg de nutriente e no NCI.
  - **Não-nutrientes ficaram fora de `nutrients`**, como sempre: COT,
    Ascophyllum nodosum, aminoácidos, glicina betaína, ácidos fúlvicos,
    D-limoneno, óleo mineral e as contagens de UFC dos inoculantes. O texto
    integral da garantia fica em `composition`, então nada se perde.
  - **"K 1%" no Manganês Kmol** foi lido como K2O, com a mesma anotação de
    conferência usada nos materiais ICL.
  - **Pares da matriz de equivalência.** A matriz cadastrou "Orggam /
    Ferggum" como um registro só, e a planilha mostra que são dois produtos
    com composições diferentes. Atribuir ao par a garantia de um dos dois
    seria atribuí-la também ao outro, então o par continua **sem composição**
    (com nota explicando) e Orggam e Ferggum entraram separados, cada um com
    a sua. O par não pode ser apagado: a matriz de equivalência aponta para
    ele. "Vigga / Nematak" foi enriquecido direto, porque Vigga não declara
    composição e não havia conflito a criar.

- **Portfólio e posicionamento AGROCETE** — material oficial da própria
  Agrocete, com a tabela `PRODUTOS × GARANTIAS × SOJA × MILHO × FEIJÃO ×
  COMPOSIÇÃO/TECNOLOGIA`. É a primeira fonte que traz **dose por cultura** e a
  **tecnologia** de cada produto da casa. Resultado: **31 produtos
  enriquecidos** e 1 recadastrado.

  - **A extração foi por coordenada**, usando as réguas verticais da própria
    tabela (`page.edges`), não por texto corrido: o `extract_text()` intercala
    as três colunas de dose na mesma linha, e a dose da Soja acabaria na
    Milho.
  - **Conferência antes de importar.** As garantias trazem o par `% (g/L)`, o
    que permite derivar a densidade e checar contra a cadastrada. **26 das 33
    linhas bateram exatamente.** As divergências foram anotadas nas
    observações do produto, mantendo o valor da base — nunca sobrescrito:
    - *GRAP Manganês RR Plus* — o material diz `Mn 7% (171,6 g)` e
      `S 4% (100,1 g)`, o que implicaria densidade ~2,48 (implausível para um
      foliar). Esses gramas são exatamente os do GRAP 140 Fluid. A base
      (87,5 / 50 a 1,25) é coerente consigo mesma.
    - *GRAP Amyno 15* e *GRAP Mont 15* — o Mn implica densidade 1,35 e o S
      implica 1,53 dentro da **mesma linha**. A observação já cadastrada
      desses produtos confirma `S 5% (67,50 g/L)`, que é o valor da base.
    - *GRAP Organo TOP* — o material traz P2O5 0,20%, que a base não tinha; a
      base traz K2O e B, que o material não lista.
  - **Preencher lacuna ≠ sobrescrever.** Nutriente ausente na base só entrou
    quando a densidade implícita bate com a cadastrada: *GRAP PHIL Cobre*
    ganhou o P2O5 256 g/L (a própria observação antiga já dizia "20% de P2O5
    proveniente de ác. fosforoso", mas o valor não estava em `nutrients`) e
    *GRAP D-LIM* ganhou N 21,2 e B 5,3 g/L, com a densidade 1,06 que os dois
    valores implicam de forma concordante.
  - **GRAP PHIL K voltou ao catálogo.** Tinha saído por não constar na
    planilha interna mais recente; reapareceu num material oficial. Entra só
    com o percentual — o material não traz g/L nem densidade — e as três
    culturas aparecem sem dose.

- **Guia Técnico Nitro (Fev 2024, V6)** — planilha
  `NITRO_Garantias_Comparador.xlsx` com duas abas: as **garantias das 30
  linhas** do portfólio Nitro e uma tabela de **sais e matérias-primas**. A
  NITRO estava no catálogo desde a matriz de equivalência, mas **só com
  nomes** — nenhum dos 17 registros tinha composição. Resultado: **21 produtos
  novos e 9 enriquecidos**, e a marca saiu de 0 para **30 produtos com
  garantia declarada** (38 no total).

  - **Só percentual, em todas as linhas.** O guia publica `%m/m` e não traz
    densidade, dose nem indicação de sólido/líquido. Então nenhum produto foi
    convertido para g/L ou g/kg: todos entram em `nutrientsPercent`, com
    `nutrients` vazio, e a ficha diz por que o produto ainda não entra em
    custo por kg de nutriente. Assumir densidade 1,0 (ou "é pó, então g/kg")
    seria inventar a base da conta.
  - **Casamento produto a produto, escrito à mão.** O guia escreve os nomes em
    caixa alta e com barra (`FORCE /Mn-N`, `COMPAT /COMPLEX`, `GROWN`), o que
    faria uma heurística de nome errar. As 9 correspondências com registros já
    existentes foram decididas uma a uma e ficam **anotadas na observação do
    produto** ("Casado com a linha X do guia da Nitro"), junto da garantia
    declarada — dá para conferir sem abrir a planilha.
  - **Enriquecimento, não sobrescrita**, como nas importações anteriores:
    nenhum dos 9 registros tinha garantia numérica, então não houve conflito a
    resolver. A categoria antiga foi mantida; a linha do guia entrou no campo
    `line`.
  - **Categoria dos produtos novos** vem da coluna "Linha" da planilha: as
    linhas *Linha Solo* e *Tratamento de Sementes* foram para as categorias de
    mesmo sentido que já existiam no catálogo, e o resto ficou em "Nutrição e
    Fisiologia" — que é a categoria dos produtos NITRO já cadastrados e o
    próprio assunto do guia.
  - **Sais e matérias-primas** (segunda aba) **não entraram no catálogo.** Não
    são produtos comerciais: não têm marca, dose nem preço, e apareceriam na
    busca e no comparativo como se fossem. Viraram uma tabela de referência em
    `src/data/rawMaterials.js`, exibida na página **Sobre** — 8 matérias-primas
    com solubilidade (g/L) e garantia declarada. Não entra em nenhum cálculo, e
    a tela avisa que a solubilidade vem **sem temperatura de referência**, ou
    seja, não é limite de calda.
  - **"P" lido como P2O5** no MAP purificado, com a mesma convenção de rótulo
    já usada nos materiais ICL e Gran7 — e a divergência de símbolo está
    escrita embaixo da tabela.

### Campos novos da ficha técnica

Essas planilhas traziam informação que não cabia em nenhum campo existente e
que seria perdida se fosse jogada em `observations`. Em vez disso, o produto
ganhou campos próprios, e a ficha técnica (`src/components/ProductSheet.jsx`)
ganhou seções que **só aparecem quando o campo existe** — produto sem o dado
não mostra seção vazia nem texto genérico:

| Campo | Seção na ficha | Produtos |
| --- | --- | --- |
| `line` | linha/família comercial no cabeçalho | 90 |
| `technology` | Tecnologia e formulação | 30 |
| `formulation` | Tecnologia e formulação | 23 |
| `chelate` | Tecnologia e formulação (quelatizante) | 5 |
| `applicationPhase` | Aplicação (fase/modo) | 41 |
| `mixOrder` | Aplicação (ordem de mistura na calda) | 4 |
| `compatibility` | Aplicação (compatibilidade declarada) | 10 |
| `ph` | Propriedades físico-químicas | 8 |
| `salineIndex` | Propriedades físico-químicas | 3 |
| `benefits` | Benefícios declarados | 79 |
| `evidence` | Resultado citado | 10 |
| `agroceteEquivalent` | Correlato Agrocete | 2 |

Os textos de `benefits` e `evidence` são **transcrição do material do
fabricante**, não avaliação da plataforma — a ficha diz isso na própria
seção ("declarados", "resultado citado"), e nada disso entra no NCI nem em
qualquer cálculo.

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

## Tela de entrada

A primeira tela do app é o `SignInPage` (`src/components/SignInPage.jsx`,
estilo em `src/signin.css`): formulário à esquerda, foto de lavoura com os
números reais da base à direita.

- **A tela não valida nada.** Ela recebe `onSubmit`, `error`, `hint` e `busy`;
  quem decide se a senha vale é o `PasswordGate`. Trocar a autenticação depois
  (login por pessoa, SSO) não encosta no layout.
- **Os cartões da direita são dados medidos**, lidos de `platformStats()` — os
  mesmos números da página Sobre. Não são depoimentos: inventar elogios
  assinados por pessoas que não existem, numa tela de entrada de ferramenta
  interna, seria mentira com cara de prova social.
- **A foto é decoração e pode faltar.** O painel tem um gradiente por baixo,
  então sem internet (uso em campo, ou o build de arquivo único aberto direto
  do disco) a tela continua inteira em vez de virar um retângulo branco. No
  celular a coluna da foto sai: o que interessa ali é o campo de senha.
- **"Manter conectado" escolhe onde o desbloqueio fica.** Marcado, vai pro
  `localStorage` e dura entre sessões; desmarcado, vai pro `sessionStorage` e
  some ao fechar a aba — que é o certo no computador compartilhado do
  escritório.
- **"Esqueci a senha" não finge um fluxo que não existe:** responde que a
  entrada é uma senha só, compartilhada, e manda pedir a quem administra.
- **Botão do Google e "criar conta"** existem no componente (props
  `onGoogleSignIn` e `onCreateAccount`) mas **não são renderizados**, porque a
  plataforma não tem backend de autenticação nem cadastro. Botão que não faz
  nada é pior que botão nenhum. Passe os handlers no dia em que existir login
  por pessoa e os dois aparecem.
- O tema (claro/escuro) é aplicado no boot, em `main.jsx`, via
  `src/lib/theme.js` — antes a alternância morava no App, que só monta depois
  do login, e quem usa tema escuro via um flash branco na entrada.

### Sobre shadcn/ui, Tailwind e TypeScript

O componente de origem vinha em TSX com classes do Tailwind e o caminho
`@/components/ui`. **Nada disso foi instalado**, e a tela foi reescrita em
JSX com os tokens de `src/theme.css`. O motivo é o mesmo já registrado na
seção "Sobre Tailwind": este é um app Vite + React em JavaScript, com ~50 mil
linhas de JSX e um design system próprio em CSS custom properties. Instalar
Tailwind 4, TypeScript e a estrutura da shadcn por causa de uma tela
significaria duas linguagens de estilo convivendo no mesmo app — e a tela de
entrada, que precisa ser idêntica ao resto, seria justamente a que ficaria
diferente.

O que foi mantido do original: o layout de duas colunas, a foto com cartões
flutuantes, o campo "de vidro" que acende no foco, o olho de mostrar/ocultar
senha (`lucide-react`, que o projeto já usa), a entrada animada com atraso
escalonado e a mesma superfície de props.

Se um dia a stack for migrada de fato, o caminho é: `npx shadcn@latest init`
(que cria `components.json`, `src/components/ui` e o `@/*` no `tsconfig` +
`vite.config`), `npm i -D tailwindcss @tailwindcss/vite typescript` com o
plugin no `vite.config.js`, e `@import "tailwindcss"` no CSS de entrada. A
pasta `components/ui` é exigência da CLI da shadcn: é onde ela escreve e
atualiza os componentes que você instala, e fora dela `npx shadcn add` não
encontra o que sobrescrever. Só que isso é uma migração de stack do app
inteiro, não um passo desta tela — e a orientação registrada no projeto,
desde o começo, é não trocar de stack por estética.

## Tela de senha

A regra de acesso continua em `src/PasswordGate.jsx` — pensada para
publicações em hosts gratuitos, onde não dá pra restringir acesso de outra
forma sem custo.
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

Depois de acertar a senha uma vez, o navegador lembra e não pede de novo
nesse dispositivo — em `localStorage` se "manter conectado" estava marcado, em
`sessionStorage` (só até fechar a aba) se não estava.

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
