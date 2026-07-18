import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9337;
const mobile = process.argv.includes("--mobile");
const profile = await mkdtemp(path.join(tmpdir(), "fluency-secrets-qa-"));
const url = "http://localhost:3000/fluency-secrets?chapter=o-pendrive&page=0";

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=1280,800",
    url,
  ],
  { stdio: "ignore" },
);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page" && target.url.includes("/fluency-secrets"));
      if (page) return page;
    } catch {
      // Chrome is still starting.
    }
    await delay(150);
  }
  throw new Error("Chrome DevTools target did not become available.");
}

const target = await getTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  pending.get(message.id)(message);
  pending.delete(message.id);
});

function command(method, params = {}) {
  const id = nextId;
  nextId += 1;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

async function evaluate(expression) {
  const response = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.result?.exceptionDetails) {
    throw new Error(response.result.exceptionDetails.text);
  }
  return response.result?.result?.value;
}

try {
  await command("Runtime.enable");
  if (mobile) {
    await command("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
  }
  await evaluate(`new Promise((resolve) => {
    const ready = () => {
      const indicator = document.querySelector("[data-page-indicator]");
      const numbers = indicator ? indicator.textContent.match(/[0-9]+/g) : null;
      if (numbers && Number(numbers[1]) > 2) resolve(true);
      else setTimeout(ready, 50);
    };
    ready();
  })`);
  await delay(600);

  const readPage = () =>
    evaluate(`(() => {
      const indicator = document.querySelector("[data-page-indicator]");
      const numbers = indicator ? indicator.textContent.match(/[0-9]+/g) : null;
      if (!numbers) throw new Error("Page indicator unavailable");
      return Number(numbers[0]);
    })()`);

  const navigation = { start: await readPage() };
  navigation.clickEventSeen = await evaluate(`(() => {
    const button = document.querySelector("[data-page-next]");
    let seen = 0;
    button.addEventListener("click", () => { seen += 1; }, { once: true });
    button.click();
    return seen;
  })()`);
  await delay(300);
  navigation.clickNext = await readPage();

  await command("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await command("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await delay(300);
  navigation.keyboardNext = await readPage();

  await command("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37 });
  await command("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37 });
  await delay(300);
  navigation.keyboardPrevious = await readPage();

  await command("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: mobile ? 195 : 640,
    y: 400,
    deltaX: 0,
    deltaY: 140,
  });
  await delay(600);
  navigation.wheelNext = await readPage();

  await command("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: mobile ? 340 : 850, y: 380, radiusX: 2, radiusY: 2, force: 1, id: 1 }],
  });
  await command("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: mobile ? 60 : 520, y: 380, radiusX: 2, radiusY: 2, force: 1, id: 1 }],
  });
  await command("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await delay(350);
  navigation.swipeNext = await readPage();

  const expectedNavigation = {
    start: 1,
    clickNext: 2,
    keyboardNext: 3,
    keyboardPrevious: 2,
    wheelNext: 3,
    swipeNext: 4,
  };

  for (const [key, expected] of Object.entries(expectedNavigation)) {
    if (navigation[key] !== expected) {
      throw new Error(`Navigation check failed for ${key}: expected ${expected}, received ${navigation[key]}. ${JSON.stringify(navigation)}`);
    }
  }

  const chapters = await evaluate(`(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const links = Array.from(document.querySelectorAll("[data-chapter-link]"));
    const results = [];
    for (let index = 0; index < links.length; index += 1) {
      links[index].click();
      await wait(180);
      const viewport = document.querySelector("[data-column-viewport]");
      const content = document.querySelector("[data-column-content]");
      const blocks = Array.from(content.querySelectorAll(":scope > figure, :scope > aside, :scope > section, :scope > div, :scope > header"));
      const indicatorNumbers = document.querySelector("[data-page-indicator]").textContent.match(/[0-9]+/g).map(Number);
      const pageCount = indicatorNumbers[1];
      const stride = content.scrollWidth / pageCount;
      const viewportLeft = viewport.getBoundingClientRect().left;
      const pageCharacterCounts = Array(pageCount).fill(0);
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let textNode = walker.nextNode();
      while (textNode) {
        for (let offset = 0; offset < textNode.data.length; offset += 1) {
          if (/\\s/.test(textNode.data[offset])) continue;
          range.setStart(textNode, offset);
          range.setEnd(textNode, offset + 1);
          const rect = range.getBoundingClientRect();
          if (!rect.width && !rect.height) continue;
          const page = Math.max(0, Math.min(pageCount - 1, Math.round((rect.left - viewportLeft) / stride)));
          pageCharacterCounts[page] += 1;
        }
        textNode = walker.nextNode();
      }
      const visualPages = [...new Set(blocks.map((element) => {
        const rect = element.getBoundingClientRect();
        return Math.max(0, Math.min(pageCount - 1, Math.round((rect.left - viewportLeft) / stride)));
      }))];
      const oversized = blocks
        .map((element) => Math.ceil(element.getBoundingClientRect().height))
        .filter((height) => height > viewport.clientHeight + 1);
      const indicator = document.querySelector("[data-page-indicator]").textContent;
      results.push({
        title: links[index].querySelector("strong").textContent,
        indicator,
        viewportHeight: viewport.clientHeight,
        scrollWidth: content.scrollWidth,
        blocks: blocks.length,
        oversized,
        pageCharacterCounts,
        visualPages,
      });
    }
    return results;
  })()`);

  if (chapters.length !== 23) {
    throw new Error(`Expected 23 chapters/sections, received ${chapters.length}.`);
  }

  const invalid = chapters.filter(
    (chapter) =>
      chapter.oversized.length > 0 ||
      chapter.scrollWidth <= 0 ||
      !/P.GINA 1 DE [2-9][0-9]*/.test(chapter.indicator),
  );
  if (invalid.length) {
    throw new Error(`Chapter integrity failed: ${JSON.stringify(invalid, null, 2)}`);
  }

  const densityValues = chapters.flatMap((chapter) =>
    chapter.pageCharacterCounts.filter(
      (count, page) =>
        page > 0 &&
        page < chapter.pageCharacterCounts.length - 1 &&
        !chapter.visualPages.includes(page),
    ),
  );
  const sortedDensity = [...densityValues].sort((a, b) => a - b);
  const densityMedian = sortedDensity[Math.floor(sortedDensity.length / 2)] ?? 0;
  const density = {
    measuredTextPages: densityValues.length,
    medianCharacters: densityMedian,
    minimumTarget: Math.floor(densityMedian * 0.6),
    maximumTarget: Math.ceil(densityMedian * 1.4),
    outliers: densityValues.filter(
      (count) => count < densityMedian * 0.6 || count > densityMedian * 1.4,
    ),
  };
  if (density.outliers.length) {
    throw new Error(`Text page density failed: ${JSON.stringify(density)}`);
  }

  const reverseNavigation = await evaluate(`(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    document.querySelectorAll("[data-chapter-link]")[1].click();
    await wait(250);
    document.querySelector("[data-page-previous]").click();
    await wait(350);
    const numbers = document.querySelector("[data-page-indicator]").textContent.match(/[0-9]+/g).map(Number);
    return {
      title: document.querySelector("[data-chapter-link].${"chapterActive"} strong")?.textContent,
      page: numbers[0],
      total: numbers[1],
    };
  })()`);
  if (reverseNavigation.page !== reverseNavigation.total || reverseNavigation.total < 2) {
    throw new Error(`Reverse chapter navigation failed: ${JSON.stringify(reverseNavigation)}`);
  }

  await command("Page.enable");
  await command("Page.navigate", {
    url: "http://localhost:3000/fluency-secrets?chapter=o-pendrive&page=1&fontSize=24&theme=dark",
  });
  await delay(250);
  const readingPreferences = await evaluate(`new Promise((resolve) => {
    const ready = () => {
      const reader = document.querySelector("[data-reader]");
      const indicator = document.querySelector("[data-page-indicator]");
      const numbers = indicator?.textContent.match(/[0-9]+/g)?.map(Number);
      const viewport = document.querySelector("[data-column-viewport]");
      const content = document.querySelector("[data-column-content]");
      if (!reader || !numbers || numbers[1] < 2 || !viewport || !content) {
        setTimeout(ready, 50);
        return;
      }
      resolve({
        page: numbers[0],
        total: numbers[1],
        fontSize: getComputedStyle(reader).getPropertyValue("--reader-font-size").trim(),
        dark: reader.className.includes("theme_dark"),
        oversized: Array.from(content.querySelectorAll(":scope > figure, :scope > aside, :scope > section, :scope > div, :scope > header"))
          .some((element) => element.getBoundingClientRect().height > viewport.clientHeight + 1),
      });
    };
    ready();
  })`);
  if (
    readingPreferences.page !== 2 ||
    readingPreferences.fontSize !== "24px" ||
    !readingPreferences.dark ||
    readingPreferences.oversized
  ) {
    throw new Error(`Reading preferences failed: ${JSON.stringify(readingPreferences)}`);
  }

  console.log(JSON.stringify({
    viewport: mobile ? "mobile-390x844" : "desktop-1280x800",
    navigation,
    reverseNavigation,
    readingPreferences,
    density,
    chapters,
    status: "PASS",
  }, null, 2));
} finally {
  socket.close();
  chrome.kill();
}
