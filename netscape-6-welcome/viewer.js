const root = document.documentElement;
const contentPlane = document.querySelector('.content-plane');
const sourceMeasure = document.querySelector('.source-measure');
const zoomRange = document.querySelector('.zoom-range');
const zoomOutput = document.querySelector('.zoom-value');
const rotateXRange = document.querySelector('.rotate-x-range');
const rotateYRange = document.querySelector('.rotate-y-range');
const rotateZRange = document.querySelector('.rotate-z-range');
const perspectiveRange = document.querySelector('.perspective-range');
const rotateXOutput = document.querySelector('.rotate-x-value');
const rotateYOutput = document.querySelector('.rotate-y-value');
const rotateZOutput = document.querySelector('.rotate-z-value');
const perspectiveOutput = document.querySelector('.perspective-value');
const depthRange = document.querySelector('.depth-range');
const depthOutput = document.querySelector('.depth-value');
const explodeButton = document.querySelector('.explode-button');
const zoomStep = Number(zoomRange.step);
const zoomMin = Number(zoomRange.min);
const zoomMax = Number(zoomRange.max);

let exploded = false;

function setZoom(percent) {
  const next = Math.min(zoomMax, Math.max(zoomMin, percent));
  const zoom = next / 100;
  zoomRange.value = String(next);
  root.style.setProperty('--zoom', String(zoom));
  root.style.setProperty('--scaled-content-width', `${606 * zoom}px`);
  root.style.setProperty('--scaled-content-height', `${464 * zoom}px`);
  zoomOutput.textContent = `${next}%`;
}

function setRotation(axis, degrees) {
  root.style.setProperty(`--rotate-${axis}`, `${degrees}deg`);

  if (axis === 'x') {
    rotateXRange.value = String(degrees);
    rotateXOutput.textContent = `X ${degrees}`;
  } else if (axis === 'y') {
    rotateYRange.value = String(degrees);
    rotateYOutput.textContent = `Y ${degrees}`;
  } else {
    rotateZRange.value = String(degrees);
    rotateZOutput.textContent = `Zr ${degrees}`;
  }
}

function setPerspective(value) {
  perspectiveRange.value = String(value);
  root.style.setProperty('--perspective', `${value}px`);
  perspectiveOutput.textContent = `P ${value}`;
}

function scopeSelector(rootSelector, selector) {
  const trimmed = selector.trim();
  if (trimmed === 'html' || trimmed === 'body') return rootSelector;
  if (trimmed.startsWith('html ')) return `${rootSelector} ${trimmed.slice(5)}`;
  if (trimmed.startsWith('body ')) return `${rootSelector} ${trimmed.slice(5)}`;
  return `${rootSelector} ${trimmed}`;
}

function scopeCss(cssText, rootSelector) {
  return cssText.replace(/(^|})\s*([^@{}][^{]+)\{/g, (match, brace, selectorText) => {
    const scoped = selectorText
      .split(',')
      .map((selector) => scopeSelector(rootSelector, selector))
      .join(', ');
    return `${brace}\n${scoped} {`;
  });
}

function installSourceStyles(doc) {
  document.getElementById('viewer-source-style')?.remove();

  const sourceCss = Array.from(doc.querySelectorAll('style'))
    .map((style) => style.textContent)
    .join('\n');

  const style = document.createElement('style');
  style.id = 'viewer-source-style';
  style.textContent = [
    scopeCss(sourceCss, '.source-measure'),
    scopeCss(sourceCss, '.content-plane'),
    '.content-plane, .content-plane * { transform-style: preserve-3d !important; }'
  ].join('\n');
  document.head.appendChild(style);
}

function clearNormalizedContent() {
  contentPlane.querySelectorAll('.stage-backdrop, .normalized-layer').forEach((element) => {
    element.remove();
  });
}

function setLayerGeometry(target, source, stageRect) {
  const sourceRect = source.getBoundingClientRect();
  const style = window.getComputedStyle(source);

  target.style.position = 'absolute';
  target.style.left = `${sourceRect.left - stageRect.left}px`;
  target.style.top = `${sourceRect.top - stageRect.top}px`;
  target.style.width = `${sourceRect.width}px`;
  target.style.height = `${sourceRect.height}px`;
  target.style.margin = '0';
  target.style.transform = style.transform === 'none' ? 'none' : style.transform;
  target.style.transformOrigin = style.transformOrigin;
  target.style.zIndex = style.zIndex;
}

function shouldPromoteNestedLayer(element) {
  return element.matches('.netscape-layer');
}

function collectSourceLayers(stage) {
  const layers = [];

  Array.from(stage.children).forEach((child) => {
    const promoted = Array.from(child.querySelectorAll('*')).filter(shouldPromoteNestedLayer);

    if (promoted.length > 0) {
      layers.push(...promoted);
      return;
    }

    layers.push(child);
  });

  return layers;
}

function buildNormalizedLayers(stage) {
  clearNormalizedContent();

  const backdrop = document.createElement('div');
  backdrop.className = 'stage-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  contentPlane.appendChild(backdrop);

  const stageRect = stage.getBoundingClientRect();
  collectSourceLayers(stage).forEach((source, index) => {
    const clone = source.cloneNode(true);
    clone.classList.add('normalized-layer');
    clone.dataset.viewerLayer = String(index);
    clone.dataset.viewerOriginalTransform = clone.style.transform || 'none';
    setLayerGeometry(clone, source, stageRect);
    contentPlane.appendChild(clone);
  });
}

function applyDepth() {
  contentPlane.classList.toggle('is-exploding', exploded);

  const depth = Number(depthRange.value);
  depthOutput.textContent = `Z ${depth}`;

  contentPlane.querySelectorAll('.normalized-layer').forEach((element) => {
    const original = element.dataset.viewerOriginalTransform || 'none';
    const base = original === 'none' ? '' : `${original} `;
    const rank = Number(element.dataset.viewerLayer);
    const z = exploded ? (rank + 1) * depth * 1.005 : 0;
    element.style.transform = z === 0 ? original : `${base}translateZ(${z}px)`;
  });

}

function toggleExplode() {
  exploded = !exploded;
  if (exploded && Number(depthRange.value) === 0) {
    depthRange.value = '45';
  }
  explodeButton.classList.toggle('is-active', exploded);
  explodeButton.setAttribute('aria-pressed', String(exploded));
  applyDepth();
}

function reset3d() {
  exploded = false;
  explodeButton.classList.remove('is-active');
  explodeButton.setAttribute('aria-pressed', 'false');
  depthRange.value = '0';
  setRotation('x', 43);
  setRotation('y', 10);
  setRotation('z', -15);
  setPerspective(1050);
  applyDepth();
}

async function loadSourcePage() {
  const response = await fetch('./index.html', { cache: 'no-store' });
  const text = await response.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const sourceStage = doc.querySelector('.welcome-stage');

  if (!sourceStage) {
    throw new Error('Missing .welcome-stage in index.html');
  }

  installSourceStyles(doc);
  sourceMeasure.replaceChildren(sourceStage.cloneNode(true));
  await document.fonts.ready;
  buildNormalizedLayers(sourceMeasure.querySelector('.welcome-stage'));
  applyDepth();
}

zoomRange.addEventListener('input', () => setZoom(Number(zoomRange.value)));
rotateXRange.addEventListener('input', () => setRotation('x', Number(rotateXRange.value)));
rotateYRange.addEventListener('input', () => setRotation('y', Number(rotateYRange.value)));
rotateZRange.addEventListener('input', () => setRotation('z', Number(rotateZRange.value)));
perspectiveRange.addEventListener('input', () => setPerspective(Number(perspectiveRange.value)));
depthRange.addEventListener('input', applyDepth);

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const current = Number(zoomRange.value);
  if (button.dataset.action === 'zoom-out') setZoom(current - zoomStep);
  if (button.dataset.action === 'zoom-in') setZoom(current + zoomStep);
  if (button.dataset.action === 'reset-zoom') setZoom(100);
  if (button.dataset.action === 'reset-3d') reset3d();
  if (button.dataset.action === 'explode') toggleExplode();
});

setZoom(Number(zoomRange.value));
setRotation('x', Number(rotateXRange.value));
setRotation('y', Number(rotateYRange.value));
setRotation('z', Number(rotateZRange.value));
setPerspective(Number(perspectiveRange.value));
loadSourcePage().catch((error) => {
  console.error(error);
});
