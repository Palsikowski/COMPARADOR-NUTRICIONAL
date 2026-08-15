// Casamento do texto lido na foto com os produtos do catálogo.
//
// O reconhecimento é por **texto do rótulo** (OCR), não por aparência da
// embalagem: não existe nenhuma foto de produto cadastrada na base, então não
// há como treinar reconhecimento visual. O nome impresso no rótulo é o dado
// que dá pra ler e casar com os nomes do catálogo.
//
// Como o OCR erra letras (rótulo curvo, brilho, ângulo), o casamento é
// tolerante: normaliza, compara por tokens e usa distância de edição. O
// resultado é sempre uma LISTA de candidatos com confiança — quem confirma é
// a pessoa, nunca o app sozinho.

import { PRODUCTS } from "../data/products.js";
import { AGROCETE } from "./catalog.js";

export function norm(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Palavras que aparecem em quase todo rótulo e não ajudam a distinguir.
const STOPWORDS = new Set([
  "FERTILIZANTE", "FOLIAR", "MINERAL", "MISTO", "SOLUCAO", "SUSPENSAO", "L", "KG", "ML", "G",
  "LITROS", "LITRO", "PRODUTO", "USO", "AGRICOLA", "COMPOSICAO", "GARANTIA", "REGISTRO", "LOTE",
  "FABRICACAO", "VALIDADE", "CONTEUDO", "LIQUIDO", "PESO", "NET", "INDUSTRIA", "BRASILEIRA",
]);

function tokens(s) {
  return norm(s)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

// Levenshtein com corte: acima de `max` não interessa o valor exato.
function editDistance(a, b, max = 3) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = new Array(b.length + 1);
  const cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let best = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

// Tolerância a erro proporcional ao tamanho da palavra. Curta tem que bater
// exata: em "GRAP" vs "GRAD" uma letra é 25% da palavra, e aceitar isso fazia
// produtos diferentes empatarem com o certo.
function editTolerance(len) {
  if (len <= 4) return 0;
  if (len <= 7) return 1;
  return 2;
}

// Um token do OCR "casa" com um token do produto. Devolve 1 (exato), um valor
// menor pra casamento aproximado, ou 0.
function tokenMatches(ocrTok, prodTok) {
  if (ocrTok === prodTok) return 1;
  // Leitura parcial só vale com prefixo longo (evita "CA" casar com "CAB").
  const shorter = Math.min(ocrTok.length, prodTok.length);
  if (shorter >= 5 && (prodTok.startsWith(ocrTok) || ocrTok.startsWith(prodTok))) {
    return 0.75 * (shorter / Math.max(ocrTok.length, prodTok.length));
  }
  const tol = editTolerance(prodTok.length);
  if (tol > 0 && editDistance(ocrTok, prodTok, tol) <= tol) return 0.7;
  return 0;
}

/**
 * Recebe o texto bruto do OCR e devolve candidatos ordenados.
 * Cada item: { product, score (0-1), matched, brandHit, exactPhrase }
 */
export function matchProductsFromText(rawText, { limit = 6, minScore = 0.45 } = {}) {
  const ocrNorm = norm(rawText);
  const ocrTokens = Array.from(new Set(tokens(rawText)));
  if (ocrTokens.length === 0) return [];

  const results = [];
  for (const p of PRODUCTS) {
    const prodTokens = tokens(p.name);
    if (prodTokens.length === 0) continue;

    let sum = 0;
    let exactHits = 0;
    let longestExact = 0;
    const matched = [];
    for (const pt of prodTokens) {
      let best = 0;
      let bestTok = null;
      for (const ot of ocrTokens) {
        const m = tokenMatches(ot, pt);
        if (m > best) {
          best = m;
          bestTok = ot;
        }
      }
      if (best > 0) {
        sum += best;
        matched.push(bestTok);
        if (best === 1) {
          exactHits += 1;
          longestExact = Math.max(longestExact, pt.length);
        }
      }
    }
    if (sum === 0) continue;

    // Nome inteiro aparecendo no texto lido é a evidência mais forte possível.
    const nameNorm = norm(p.name);
    const exactPhrase = nameNorm.length >= 5 && ocrNorm.includes(nameNorm);

    // Exige âncora: pelo menos um token exato com 4+ letras, ou o nome inteiro.
    // Sem isso, só ruído aproximado já colocava produto na lista.
    if (!exactPhrase && longestExact < 4) continue;

    // Cobertura do nome do produto pelo que foi lido na foto.
    let score = sum / prodTokens.length;

    // Nome de uma palavra só ("Cálcio", "CaB", "Boro") casa por acaso com
    // facilidade: é justamente o nome genérico que dezenas de marcas usam. Sem
    // a marca confirmando na foto, não pode empatar com um nome composto que
    // bateu inteiro — senão o "Cálcio" de qualquer empresa passa na frente do
    // "Grap Cálcio" que a foto realmente mostra.
    const brandToks = tokens(p.brand);
    const brandHit = brandToks.length > 0 && brandToks.every((bt) => ocrTokens.some((ot) => tokenMatches(ot, bt) === 1));
    if (prodTokens.length === 1 && !brandHit) score *= longestExact <= 4 ? 0.55 : 0.72;

    if (exactPhrase) score = Math.max(score, 0.9);
    if (brandHit) score += 0.12;
    if (p.brand === AGROCETE) score += 0.01;

    results.push({ product: p, score: Math.min(score, 1), matched, brandHit, exactPhrase });
  }

  // Empate no score é comum (vários produtos batem o nome inteiro). A marca
  // lida na mesma foto é o desempate mais forte que existe, depois o nome
  // completo, depois o nome mais específico — nunca a ordem alfabética.
  results.sort(
    (a, b) =>
      b.score - a.score ||
      Number(b.brandHit) - Number(a.brandHit) ||
      Number(b.exactPhrase) - Number(a.exactPhrase) ||
      b.matched.length - a.matched.length ||
      a.product.name.localeCompare(b.product.name)
  );
  return results.filter((r) => r.score >= minScore).slice(0, limit);
}

/**
 * Marcas do catálogo cujo nome aparece inteiro no texto lido.
 *
 * Serve para o caso mais comum de falha: o OCR lê a marca (logo grande, fonte
 * limpa) mas erra o nome do produto (fonte estilizada, curva da embalagem).
 * Antes disso a tela dizia só "nenhum produto reconhecido" e a pessoa
 * recomeçava do zero, mesmo com meia identificação na mão. Devolver a marca
 * permite oferecer o portfólio dela para escolha — sem fingir que o produto
 * foi identificado.
 */
export function brandsFromText(rawText, { limit = 3 } = {}) {
  const ocrTokens = new Set(tokens(rawText));
  if (ocrTokens.size === 0) return [];

  const counts = new Map();
  for (const p of PRODUCTS) counts.set(p.brand, (counts.get(p.brand) || 0) + 1);

  const hits = [];
  for (const brand of counts.keys()) {
    const bt = tokens(brand);
    // Marca de um token só com 3 letras ou menos ("ICL" vira "ICL", ok; mas
    // siglas curtas casam por acaso) exige token idêntico, que é o que
    // ocrTokens.has já faz. Marcas compostas exigem todos os tokens.
    if (bt.length === 0 || !bt.every((t) => ocrTokens.has(t))) continue;
    hits.push({ brand, count: counts.get(brand), weight: bt.join("").length });
  }
  hits.sort((a, b) => b.weight - a.weight || b.count - a.count);
  return hits.slice(0, limit);
}

// Rótulo de confiança pra tela — nunca "identificado", sempre "provável".
export function confidenceLabel(score) {
  if (score >= 0.85) return { text: "correspondência forte", tone: "ok" };
  if (score >= 0.6) return { text: "correspondência provável", tone: "info" };
  return { text: "correspondência fraca", tone: "warn" };
}
