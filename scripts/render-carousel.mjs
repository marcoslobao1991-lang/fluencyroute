#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// CAROUSEL RENDER — Remotion Stills (local, sem Lambda)
//
// Lê props.json → renderiza cada slide como JPEG 1080×1350
// Stills são leves — roda direto no VPS sem problema.
//
// Usage: node scripts/render-carousel.mjs <carousel-dir>
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve } from 'path';

const REMOTION_PROJECT = resolve('C:/Users/Asus/my-video');

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: 'pipe', timeout: opts.timeout || 60000, ...opts }).toString().trim();
  } catch (e) {
    console.log(`  ❌ ${e.stderr?.toString()?.slice(-300) || e.message?.slice(0, 300)}`);
    throw e;
  }
}

function renderStill(compositionId, propsJson, outputPath) {
  // Write props to temp file (avoids CLI escaping hell)
  const propsFile = resolve(join(outputPath, '..', '_props_temp.json'));
  writeFileSync(propsFile, JSON.stringify(propsJson));
  const cmd = `npx remotion still ${compositionId} "${outputPath}" --image-format=jpeg --jpeg-quality=95 --props="${propsFile}"`;
  run(cmd, { cwd: REMOTION_PROJECT, timeout: 90000 });
}

// ═══════════════════════════════════════════════════════════════
//  SLIDE MAPPING — format → composition IDs + props mapping
// ═══════════════════════════════════════════════════════════════
function buildSlides(format, content) {
  const slides = [];
  const total = 10;

  switch (format) {
    case "quiz": {
      const q = content.questions || [];
      slides.push({ id: "carousel-quiz-hook", props: { hookText: content.hookText, subtitle: `${q.length} perguntas · Swipe e testa seu inglês`, total } });
      q.forEach((item, i) => {
        slides.push({ id: "carousel-quiz-question", props: { number: i + 1, question: item.question, options: item.options, context: item.context, n: slides.length + 1, total } });
        slides.push({ id: "carousel-quiz-answer", props: { number: i + 1, question: item.question, options: item.options, correctIndex: item.correctIndex, explanation: item.explanation, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-quiz-cta", props: { score: `?/${q.length}`, total } });
      break;
    }
    case "vocab": {
      const items = content.items || [];
      slides.push({ id: "carousel-vocab-hook", props: { hookText: content.hookText, count: items.length, total } });
      items.forEach((item, i) => {
        slides.push({ id: "carousel-vocab-item", props: { ...item, number: i + 1, n: slides.length + 1, total, totalItems: items.length } });
      });
      slides.push({ id: "carousel-vocab-cheatsheet", props: { items: items.map(it => ({ expression: it.expression, meaning: it.meaning })), n: slides.length + 1, total } });
      slides.push({ id: "carousel-vocab-cta", props: { total } });
      break;
    }
    case "wrong-right": {
      const items = content.items || [];
      slides.push({ id: "carousel-wr-hook", props: { hookText: content.hookText, total } });
      items.forEach((item, i) => {
        slides.push({ id: "carousel-wr-item", props: { number: i + 1, ...item, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-wr-cta", props: { total } });
      break;
    }
    case "vs": {
      const items = content.items || [];
      slides.push({ id: "carousel-vs-hook", props: { hookText: content.hookText, total } });
      items.forEach((item, i) => {
        slides.push({ id: "carousel-vs-item", props: { number: i + 1, ...item, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-vs-cta", props: { total } });
      break;
    }
    case "myth-fact": {
      const items = content.items || [];
      slides.push({ id: "carousel-reveal-hook", props: { hookText: content.hookText, total } });
      items.forEach((item, i) => {
        slides.push({ id: "carousel-reveal-statement", props: { number: i + 1, statement: item.statement, n: slides.length + 1, total } });
        slides.push({ id: "carousel-reveal-answer", props: { number: i + 1, ...item, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-bold-cta", props: { question: "Qual te surpreendeu mais?", total } });
      break;
    }
    case "tier": {
      const tiers = content.tiers || [];
      slides.push({ id: "carousel-tier-hook", props: { hookText: content.hookText, total } });
      tiers.forEach((tier, i) => {
        slides.push({ id: "carousel-tier-item", props: { tier: i, tierLabel: tier.label, expressions: tier.expressions, translations: tier.translations, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-tier-cta", props: { total } });
      break;
    }
    case "iceberg": {
      const tiers = content.tiers || [];
      slides.push({ id: "carousel-tier-hook", props: { hookText: content.hookText, label: "ICEBERG DO INGLÊS", total } });
      // Individual tier slides
      tiers.slice(0, 5).forEach((tier, i) => {
        slides.push({ id: "carousel-tier-item", props: { tier: i, tierLabel: tier.label, expressions: [tier.expression], translations: [tier.meaning], n: slides.length + 1, total } });
      });
      // Full iceberg overview
      slides.push({ id: "carousel-iceberg", props: { tiers: tiers.map(t => ({ label: t.label, example: t.expression })), n: slides.length + 1, total } });
      slides.push({ id: "carousel-tier-cta", props: { total } });
      break;
    }
    case "opinion": {
      const args = content.arguments || [];
      slides.push({ id: "carousel-opinion-hook", props: { opinion: content.opinion, total } });
      args.forEach((arg, i) => {
        slides.push({ id: "carousel-opinion-arg", props: { number: i + 1, argument: arg, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-bold-cta", props: { question: "Concorda ou discorda?", total } });
      break;
    }
    case "pov": {
      const steps = content.steps || [];
      slides.push({ id: "carousel-pov-hook", props: { pov: content.pov, total } });
      steps.forEach((step, i) => {
        slides.push({ id: "carousel-pov-step", props: { number: i + 1, text: step, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-bold-cta", props: { question: "Já aconteceu com você?", total } });
      break;
    }
    case "red-green-flag": {
      slides.push({ id: "carousel-tier-hook", props: { hookText: content.hookText || "RED FLAGS DE QUEM ESTUDA INGLÊS", label: "RED FLAGS / GREEN FLAGS", total } });
      slides.push({ id: "carousel-flags", props: { type: "red", items: content.redFlags || [], n: 2, total } });
      slides.push({ id: "carousel-flags", props: { type: "green", items: content.greenFlags || [], n: 3, total } });
      slides.push({ id: "carousel-bold-cta", props: { question: "Você tem alguma red flag?", total } });
      break;
    }
    case "mechanism": {
      const steps = content.steps || [];
      slides.push({ id: "carousel-mechanism-hook", props: { hookText: content.hookText, total } });
      steps.forEach((step, i) => {
        slides.push({ id: "carousel-mechanism-step", props: { number: i + 1, text: step.text, highlight: step.highlight, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-mechanism-reveal", props: { text: content.reveal || "O método que usa repetição musical a seu favor já existe.", brandLine: content.brandLine || "Inglês com música que gruda", n: slides.length + 1, total } });
      slides.push({ id: "carousel-mechanism-cta", props: { total } });
      break;
    }
    case "spot": {
      const errors = content.errors || [];
      slides.push({ id: "carousel-quiz-hook", props: { hookText: content.hookText || "ACHE OS 5 ERROS", subtitle: "Consegue encontrar todos?", total } });
      slides.push({ id: "carousel-spot", props: { paragraph: content.paragraph, errorCount: errors.length, n: 2, total } });
      errors.forEach((err, i) => {
        slides.push({ id: "carousel-spot-reveal", props: { number: i + 1, ...err, n: slides.length + 1, total } });
      });
      slides.push({ id: "carousel-bold-cta", props: { question: "Achou todos?", total } });
      break;
    }
  }

  // Update total in all slides
  const finalTotal = slides.length;
  slides.forEach((s, i) => {
    s.props.total = finalTotal;
    if (s.props.n !== undefined) s.props.n = i + 1;
  });

  return slides;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  const batchDir = process.argv[2];
  if (!batchDir || !existsSync(join(batchDir, 'props.json'))) {
    console.log('Usage: node scripts/render-carousel.mjs <carousel-dir>');
    process.exit(1);
  }

  const { format, content } = JSON.parse(readFileSync(join(batchDir, 'props.json'), 'utf8'));
  console.log(`\n═══ RENDER CAROUSEL: ${format.toUpperCase()} ═══\n`);

  const slides = buildSlides(format, content);
  console.log(`  ${slides.length} slides a renderizar\n`);

  const outputs = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const outputPath = resolve(join(batchDir, `slide-${String(i + 1).padStart(2, '0')}.jpeg`));
    process.stdout.write(`  Slide ${i + 1}/${slides.length} (${slide.id})...`);

    try {
      renderStill(slide.id, slide.props, outputPath);
      outputs.push(outputPath);
      console.log(` ✅`);
    } catch (e) {
      // Retry once (cold start can cause first render to timeout)
      console.log(` ⏳ retry...`);
      try {
        renderStill(slide.id, slide.props, outputPath);
        outputs.push(outputPath);
        console.log(`  ✅ (retry)`);
      } catch {
        console.log(`  ❌`);
      }
    }
  }

  // Save manifest
  writeFileSync(join(batchDir, 'slides.json'), JSON.stringify({
    format,
    slideCount: outputs.length,
    slides: outputs,
    renderedAt: new Date().toISOString(),
  }, null, 2));

  console.log(`\n═══ RENDER COMPLETO: ${outputs.length}/${slides.length} slides ═══`);
  console.log(`\nPróximo: node scripts/notify-carousel.mjs ${batchDir}\n`);
}

main().catch(e => { console.error('Render error:', e.message); process.exit(1); });
