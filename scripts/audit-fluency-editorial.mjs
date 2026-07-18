import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../app/fluency-secrets/content.tsx", import.meta.url),
  "utf8",
);

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

const chapterCount = (source.match(/\n\s+id: "/g) ?? []).length;
const secretCount = (source.match(/<Secret number=/g) ?? []).length;
const diagramCount = (source.match(/<figure /g) ?? []).length;
const chapterIds = [...source.matchAll(/\n\s+id: "([^"]+)"/g)].map((match) => match[1]);
const expectedChapterIds = [
  "o-pendrive-quase-vazio",
  "o-que-fluencia-exige",
  "aprender-nao-e-treinar",
  "tudo-volta-a-repeticao",
  "fluencia-essencial",
  "lapidar-o-ouvido",
  "expressoes",
  "do-consciente-ao-automatico",
  "repeticao-continuada",
  "por-que-discursos",
  "um-minuto-de-cada-vez",
  "um-episodio-dominado",
  "repeticao-espacada",
  "imersao-simulada",
  "o-ingles-que-fica",
  "notas-e-fontes",
];
const readingMinutes = [...source.matchAll(/readingTime: (\d+)/g)]
  .slice(1)
  .reduce((sum, match) => sum + Number(match[1]), 0);

const renderedCopy = source
  .slice(source.indexOf("export const chapters"))
  .replace(/<[^>]+>/g, " ")
  .replace(/[{}()[\],:;="]/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const wordCount = renderedCopy.match(/[A-Za-zÀ-ÿ0-9’]+/g)?.length ?? 0;

const paragraphs = [...source.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)]
  .map((match) =>
    match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/[{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  )
  .filter(Boolean);
const longestParagraph = Math.max(
  ...paragraphs.map((paragraph) => paragraph.split(/\s+/).length),
);

const forbiddenPitchSignals = [
  "apresentação complementar",
  "disponível em breve",
  "oferta escondida",
  "módulos, bônus",
  "rota preparada",
  "preparei uma aula",
];
const lowerSource = source.toLocaleLowerCase("pt-BR");
const foundPitchSignals = forbiddenPitchSignals.filter((signal) =>
  lowerSource.includes(signal),
);

const requiredMechanisms = [
  "Aprender inglês não é treinar inglês",
  "Fluência Essencial",
  "O ouvido precisa ser lapidado",
  "Repetição continuada",
  "Repetição espaçada",
  "Imersão simulada",
];
const missingMechanisms = requiredMechanisms.filter(
  (mechanism) => !source.includes(mechanism),
);
const requiredContrasts = [
  ["aprender", "treinar"],
  ["palavras", "blocos"],
  ["continuada", "espaçada"],
  ["temporada", "episódio"],
  ["consciente", "automático"],
];
const missingContrasts = requiredContrasts.filter(
  ([left, right]) => !lowerSource.includes(left) || !lowerSource.includes(right),
);
const leadCount = (source.match(/className=\{styles\.lead\}/g) ?? []).length;

requireCondition(chapterCount === 16, `Expected 16 reading sections, found ${chapterCount}.`);
requireCondition(secretCount === 15, `Expected 15 memorable Fluency Secrets, found ${secretCount}.`);
requireCondition(diagramCount >= 8, `Expected at least 8 conceptual diagrams, found ${diagramCount}.`);
requireCondition(
  JSON.stringify(chapterIds) === JSON.stringify(expectedChapterIds),
  `Belief-ladder chapter order changed: ${JSON.stringify(chapterIds)}.`,
);
requireCondition(leadCount === chapterCount, `Expected a cold open in every section, found ${leadCount}.`);
requireCondition(wordCount >= 5000, `Editorial copy is too thin: ${wordCount} words.`);
requireCondition(readingMinutes >= 55 && readingMinutes <= 90, `Reading-time promise is implausible: ${readingMinutes} minutes.`);
requireCondition(longestParagraph <= 120, `Paragraph rhythm failed: ${longestParagraph} words in one paragraph.`);
requireCondition(foundPitchSignals.length === 0, `Pitch signals found: ${foundPitchSignals.join(", ")}.`);
requireCondition(missingMechanisms.length === 0, `Missing mechanisms: ${missingMechanisms.join(", ")}.`);
requireCondition(missingContrasts.length === 0, `Missing paradigm contrasts: ${JSON.stringify(missingContrasts)}.`);

console.log(JSON.stringify({
  status: "PASS",
  chapterCount,
  secretCount,
  diagramCount,
  wordCount,
  readingMinutes,
  paragraphCount: paragraphs.length,
  longestParagraph,
  requiredMechanisms,
  requiredContrasts,
  pitchSignals: foundPitchSignals,
}, null, 2));
