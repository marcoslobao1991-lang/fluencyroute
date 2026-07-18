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
  "Imposto da Segunda Conversa",
  "Lacuna de Disponibilidade",
  "Esteira da Novidade",
  "Loop de Automatização",
  "Fluência Essencial",
  "Escada de Transferência",
];
const missingMechanisms = requiredMechanisms.filter(
  (mechanism) => !source.includes(mechanism),
);

requireCondition(chapterCount === 23, `Expected 23 reading sections, found ${chapterCount}.`);
requireCondition(secretCount === 23, `Expected 23 memorable Fluency Secrets, found ${secretCount}.`);
requireCondition(diagramCount >= 11, `Expected at least 11 conceptual diagrams, found ${diagramCount}.`);
requireCondition(wordCount >= 6000, `Editorial copy is too thin: ${wordCount} words.`);
requireCondition(readingMinutes >= 55 && readingMinutes <= 90, `Reading-time promise is implausible: ${readingMinutes} minutes.`);
requireCondition(longestParagraph <= 120, `Paragraph rhythm failed: ${longestParagraph} words in one paragraph.`);
requireCondition(foundPitchSignals.length === 0, `Pitch signals found: ${foundPitchSignals.join(", ")}.`);
requireCondition(missingMechanisms.length === 0, `Missing mechanisms: ${missingMechanisms.join(", ")}.`);

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
  pitchSignals: foundPitchSignals,
}, null, 2));
