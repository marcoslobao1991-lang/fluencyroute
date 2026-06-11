// ═══════════════════════════════════════════════════════════════
// WHISPER — Transcrição word-level via OpenAI API
// Retorna timestamps de cada palavra cantada
// ═══════════════════════════════════════════════════════════════

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const env = readFileSync(resolve('C:/Users/Asus/fluencyroute/.env.local'), 'utf8');
const OPENAI_KEY = env.match(/OPENAI_API_KEY=([^\n]+)/)?.[1]?.trim();

export async function transcribeAudio(audioPath) {
  console.log(`  🎤 Whisper transcrevendo: ${audioPath}`);

  // Converte pra WAV se necessário (Whisper API aceita mp3 tb)
  let filePath = audioPath;
  const ext = audioPath.split('.').pop().toLowerCase();

  if (ext !== 'mp3' && ext !== 'wav' && ext !== 'm4a') {
    const wavPath = audioPath.replace(/\.[^.]+$/, '_whisper.wav');
    execSync(`ffmpeg -y -i "${audioPath}" -ar 16000 -ac 1 "${wavPath}"`, { stdio: 'pipe' });
    filePath = wavPath;
  }

  const fileData = readFileSync(filePath);
  const formData = new FormData();
  formData.append('file', new Blob([fileData], { type: 'audio/mpeg' }), 'audio.mp3');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');
  formData.append('timestamp_granularities[]', 'segment');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: formData,
  });

  const data = await res.json();
  console.log(`  ✅ Transcrito: ${data.words?.length || 0} palavras, ${data.segments?.length || 0} segmentos`);
  return data;
}

// Acha onde começa a cantar (primeiro word) e onde para (último word)
export function findVocalRange(transcript) {
  const words = transcript.words || [];
  if (words.length === 0) return { start: 0, end: 10 };

  const firstWord = words[0];
  const lastWord = words[words.length - 1];

  return {
    start: firstWord.start,
    end: lastWord.end,
    words,
    totalWords: words.length,
  };
}

// Agrupa palavras por frase (baseado em pausas > 0.5s entre palavras)
export function groupIntoLines(words, pauseThreshold = 0.5) {
  const lines = [];
  let currentLine = [];

  for (let i = 0; i < words.length; i++) {
    currentLine.push(words[i]);

    const nextWord = words[i + 1];
    const gap = nextWord ? nextWord.start - words[i].end : 999;

    if (gap > pauseThreshold || !nextWord) {
      lines.push({
        text: currentLine.map(w => w.word).join(' '),
        start: currentLine[0].start,
        end: currentLine[currentLine.length - 1].end,
        words: currentLine,
      });
      currentLine = [];
    }
  }

  return lines;
}
