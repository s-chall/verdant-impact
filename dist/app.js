const COLORS = {
  'On track': '#b8ff6a',
  Watching: '#5fdde5',
  Shifting: '#69f0bd',
  'Off track': '#ff9d7a',
};

const globeEl = document.getElementById('globe');
const listEl = document.getElementById('list');
const intro = document.getElementById('intro');
const detail = document.getElementById('detail');
const $ = (id) => document.getElementById(id);

let projects = [];
let filtered = [];
let selected = null;
let globe = null;
let sceneIndex = 0;
let checking = false;

async function load() {
  try {
    const res = await fetch('data/projects.json');
    const data = await res.json();
    projects = data.projects || [];
    filtered = projects;
    const n = projects.length;
    const scenes = data.scenes || projects.reduce((a, p) => a + (p.scenes?.length || 0), 0);
    $('stats').textContent = `${n} sites · ${scenes} Sentinel-2 scenes · no login`;
    renderList();
    try {
      buildGlobe();
    } catch (err) {
      console.warn('Globe failed; list still works.', err);
    }
    const params = new URLSearchParams(location.search);
    const openId = params.get('project') || (params.get('demo') === '1' ? 'demak' : null);
    if (openId) {
      const hit = projects.find((p) => p.id === openId);
      if (hit) openProject(hit);
    }
  } catch (err) {
    $('stats').textContent = 'Archive failed to load.';
    console.error(err);
  }
}

function sparkSvg(series, color) {
  if (!series?.length) return '';
  const w = 220;
  const h = 22;
  const vals = series.map((s) => s.index);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 0.01;
  const pts = vals
    .map((v, i) => {
      const x = (i / Math.max(1, vals.length - 1)) * w;
      const y = h - 2 - ((v - min) / span) * (h - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline fill="none" stroke="${color}" stroke-width="2" points="${pts}"/></svg>`;
}

function renderList() {
  listEl.replaceChildren(
    ...filtered.map((p) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = selected?.id === p.id ? 'on' : '';
      b.innerHTML = `<span class="row"><strong></strong><span class="pct"></span></span><span class="meta"></span>`;
      b.querySelector('strong').textContent = p.name;
      b.querySelector('.pct').textContent = `${Math.round(p.progress)}%`;
      b.querySelector('.pct').style.color = COLORS[p.status] || '#b8ff6a';
      b.querySelector('.meta').textContent = `${p.place} · ${p.status}`;
      b.insertAdjacentHTML('beforeend', sparkSvg(p.series || p.scenes, COLORS[p.status]));
      b.onclick = () => openProject(p);
      li.appendChild(b);
      return li;
    }),
  );
}

function buildGlobe() {
  if (typeof Globe !== 'function') return;
  globe = Globe()(globeEl)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor('#69f0bd')
    .atmosphereAltitude(0.15)
    .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg')
    .pointsData(filtered)
    .pointLat('lat')
    .pointLng('lng')
    .pointAltitude(0.02)
    .pointRadius(0.42)
    .pointColor((d) => COLORS[d.status] || '#b8ff6a')
    .pointLabel((d) => `<b>${d.name}</b><br/>${d.place}<br/>${d.status} · ${Math.round(d.progress)}%`)
    .ringsData(filtered)
    .ringLat('lat')
    .ringLng('lng')
    .ringColor((d) => {
      const rgb = {
        'On track': '184,255,106',
        Watching: '95,221,229',
        Shifting: '105,240,189',
        'Off track': '255,157,122',
      }[d.status] || '184,255,106';
      return (t) => `rgba(${rgb},${1 - t})`;
    })
    .ringMaxRadius(2.2)
    .ringPropagationSpeed(1.05)
    .ringRepeatPeriod(1700)
    .onPointClick((d) => {
      const proj = projects.find((p) => p.id === d.id) || d;
      openProject(proj);
    })
    .width(globeEl.clientWidth)
    .height(globeEl.clientHeight)
    .pointOfView({ lat: 8, lng: 20, altitude: 2.15 }, 0);
  const controls = globe.controls?.();
  if (controls) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.32;
    controls.enableDamping = true;
  }
}

function setFilter(cat) {
  filtered = cat === 'all' ? projects : projects.filter((p) => p.category === cat);
  renderList();
  if (globe) globe.pointsData(filtered).ringsData(filtered);
}

function openProject(p) {
  if (!p?.scenes?.length) {
    p = projects.find((x) => x.id === p?.id);
  }
  if (!p?.scenes?.length) return;
  selected = p;
  sceneIndex = p.scenes.length - 1;
  checking = false;
  intro.hidden = true;
  detail.hidden = false;
  $('pPlace').textContent = `${p.place} · ${p.category}`;
  $('pName').textContent = p.name;
  $('pGoal').textContent = p.goal;
  $('pStatus').textContent = p.status;
  $('pStatus').style.color = COLORS[p.status];
  $('pOperator').textContent = p.operator;
  $('pBar').style.width = `${Math.max(4, p.progress)}%`;
  $('pBarLabel').textContent = `${p.progress}% of measured change · ${p.unit}`;
  renderScene();
  $('years').replaceChildren(
    ...p.scenes.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = String(s.year);
      b.className = i === sceneIndex ? 'on' : '';
      b.onclick = () => {
        if (checking) return;
        sceneIndex = i;
        renderScene();
        [...$('years').children].forEach((el, j) => el.classList.toggle('on', j === i));
        renderSpark();
      };
      return b;
    }),
  );
  $('miles').replaceChildren(
    ...p.milestones.map((m) => {
      const li = document.createElement('li');
      li.className = m.state || '';
      li.innerHTML = '<div class="mh"><strong></strong><b></b></div><em></em><div class="mb"><i></i></div>';
      li.querySelector('strong').textContent = m.name;
      li.querySelector('b').textContent = `${Math.round(m.pct)}%`;
      li.querySelector('em').textContent = m.detail;
      li.querySelector('i').style.width = `${Math.max(3, m.pct)}%`;
      return li;
    }),
  );
  renderSpark();
  $('result').hidden = true;
  $('agents').hidden = true;
  $('compare').hidden = true;
  $('scan').classList.remove('on');
  $('grid').classList.remove('on');
  $('runBtn').disabled = false;
  $('runBtn').textContent = 'Run satellite check';
  renderList();
  loadWeather(p);
  try {
    globe?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.4 }, 900);
  } catch {
    /* globe optional */
  }
  const url = new URL(location.href);
  url.searchParams.set('project', p.id);
  history.replaceState({}, '', url);
}

function closeProject() {
  selected = null;
  detail.hidden = true;
  intro.hidden = false;
  renderList();
  const url = new URL(location.href);
  url.searchParams.delete('project');
  url.searchParams.delete('demo');
  history.replaceState({}, '', url);
}

function renderScene() {
  const s = selected.scenes[sceneIndex];
  $('satImg').src = s.image;
  $('satDate').textContent = s.date;
  $('satMeta').textContent = `${s.cloud}% cloud · ${s.source.split('·')[0].trim()}`;
}

function renderSpark() {
  const series = selected.series || selected.scenes;
  const vals = series.map((s) => s.index);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 0.01;
  $('spark').replaceChildren(
    ...series.map((s, i) => {
      const el = document.createElement('i');
      el.style.height = `${12 + ((s.index - min) / span) * 40}px`;
      if (i === sceneIndex) el.classList.add('on');
      const lab = document.createElement('b');
      lab.textContent = String(s.year);
      el.appendChild(lab);
      el.title = `${s.year}: ${s.index}`;
      return el;
    }),
  );
}

async function loadWeather(p) {
  $('live').textContent = 'Fetching live conditions…';
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lng}&current=cloud_cover,precipitation&timezone=auto`;
    const d = await (await fetch(url)).json();
    $('live').textContent = `Now: ${Math.round(d.current.cloud_cover)}% cloud · ${d.current.precipitation} mm rain · observation only, not proof`;
  } catch {
    $('live').textContent = 'Live weather delayed.';
  }
}

function sampleIndex(imageData, signal) {
  const { data } = imageData;
  let acc = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    if (signal === 'greenness') acc += (g - r) / (g + r + 1e-6);
    else if (signal === 'water') acc += (b - r) / (b + r + 1e-6);
    else acc += (r + g + b) / 3;
  }
  return acc / n;
}

async function raster(url) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, 96, 96);
  return { img, imageData: ctx.getImageData(0, 0, 96, 96) };
}

function paintGrid(imageData) {
  const canvas = $('grid');
  const ctx = canvas.getContext('2d');
  const cols = 12;
  const rows = 9;
  const cw = canvas.width / cols;
  const ch = canvas.height / rows;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const src = imageData.data;
  const sw = imageData.width;
  const sh = imageData.height;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const sx = Math.floor((x + 0.5) * (sw / cols));
      const sy = Math.floor((y + 0.5) * (sh / rows));
      const i = (sy * sw + sx) * 4;
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];
      ctx.strokeStyle = 'rgba(184,255,106,0.28)';
      ctx.strokeRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
      ctx.fillRect(x * cw + 2, y * ch + 2, cw - 4, ch - 4);
    }
  }
}

async function animateGrid(imageData) {
  $('grid').classList.add('on');
  paintGrid(imageData);
  const canvas = $('grid');
  const ctx = canvas.getContext('2d');
  const cols = 12;
  const rows = 9;
  const cw = canvas.width / cols;
  const ch = canvas.height / rows;
  for (let i = 0; i < cols * rows; i += 6) {
    const x = i % cols;
    const y = Math.floor(i / cols) % rows;
    ctx.fillStyle = 'rgba(184,255,106,0.35)';
    ctx.fillRect(x * cw + 2, y * ch + 2, cw - 4, ch - 4);
    await new Promise((r) => setTimeout(r, 28));
  }
}

async function runCheck() {
  const p = selected;
  if (!p) return;
  checking = true;
  const btn = $('runBtn');
  btn.disabled = true;
  btn.textContent = 'Reading scenes…';
  $('agents').hidden = false;
  $('result').hidden = true;
  $('compare').hidden = true;
  $('scan').classList.add('on');
  const steps = [...$('agents').children];
  steps.forEach((el) => el.classList.remove('go'));
  for (let i = 0; i < steps.length; i += 1) {
    steps[i].classList.add('go');
    if (i === 1) {
      try {
        const latest = await raster(p.scenes[p.scenes.length - 1].image);
        await animateGrid(latest.imageData);
      } catch {
        await new Promise((r) => setTimeout(r, 400));
      }
    } else {
      await new Promise((r) => setTimeout(r, 380));
    }
    if (i < p.scenes.length) {
      sceneIndex = i;
      renderScene();
      renderSpark();
      [...$('years').children].forEach((el, j) => el.classList.toggle('on', j === i));
    }
  }
  let liveDelta = p.delta;
  let firstIdx = p.scenes[0].index;
  let lastIdx = p.scenes[p.scenes.length - 1].index;
  try {
    const first = await raster(p.scenes[0].image);
    const last = await raster(p.scenes[p.scenes.length - 1].image);
    firstIdx = sampleIndex(first.imageData, p.signal);
    lastIdx = sampleIndex(last.imageData, p.signal);
    liveDelta = lastIdx - firstIdx;
  } catch {
    /* packaged index already on the project */
  }
  $('scan').classList.remove('on');
  $('grid').classList.remove('on');
  sceneIndex = p.scenes.length - 1;
  renderScene();
  renderSpark();
  $('beforeImg').src = p.scenes[0].image;
  $('afterImg').src = p.scenes[p.scenes.length - 1].image;
  $('beforeCap').textContent = String(p.scenes[0].year);
  $('afterCap').textContent = String(p.scenes[p.scenes.length - 1].year);
  $('compare').hidden = false;
  const sign = liveDelta >= 0 ? '+' : '';
  $('result').hidden = false;
  $('result').textContent = `${p.status}. Automatic check compared ${p.scenes[0].year} → ${p.scenes[p.scenes.length - 1].year} (${p.signal} index ${sign}${liveDelta.toFixed(3)}). No human review required for this readout. Vaults are not part of this demo.`;
  btn.textContent = 'Run again';
  btn.disabled = false;
  checking = false;
}

document.querySelectorAll('.filters button').forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll('.filters button').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    setFilter(b.dataset.cat);
  };
});
$('closePanel').onclick = closeProject;
$('runBtn').onclick = runCheck;
window.addEventListener('resize', () => {
  if (globe && globeEl.clientWidth) globe.width(globeEl.clientWidth).height(globeEl.clientHeight);
});

load();
