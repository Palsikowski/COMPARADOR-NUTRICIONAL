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
com garantias de nutrientes reais extraídas dos catálogos. A seção
Agrocete está vazia por padrão — cadastre os produtos reais pelo
formulário "Adicionar produto Agrocete" dentro do app, ou edite
diretamente o array `agroceteProducts` inicial em `AgroComparador.jsx`
se quiser deixá-los pré-carregados.

## Próximos passos sugeridos (para pedir ao Claude Code)

- Persistir os manejos montados (hoje reseta ao recarregar a página) —
  pode usar `localStorage` num app fora do Claude.ai, ou um backend
  simples.
- Adicionar as demais empresas do portfólio (Brandt, Multifol, Prime,
  Genica, Arggus, Valence, União Agro etc.), extraindo as garantias de
  nutrientes dos PDFs de cada uma.
- Adicionar exportação do manejo montado em PDF ou planilha.
- Deploy (Vercel/Netlify) para acesso via link, sem precisar rodar
  localmente.
