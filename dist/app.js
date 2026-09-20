const COLORS = {
  'On track': '#b8ff6a',
  Watching: '#5fdde5',
  Shifting: '#69f0bd',
  'Off track': '#ff9d7a',
};

const ALIAS = {
  mangrove: 'demak',
  'mangrove-demak': 'demak',
  solar: 'noor',
  reef: 'gbr',
};

const SESSION_KEY = 'verdant.session';
const SAVED_KEY = 'verdant.saved';
let seenSearch = typeof location !== 'undefined' ? location.search : '';

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
let currentCat = 'all';
let lastManifest = null;
let lastSha = '';
let lastCheck = null;

function todayLabel() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function readSaved() {
  try {
    const ids = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function writeSaved(ids) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

function isSaved(id) {
  return readSaved().includes(id);
}

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

function persistUrl() {
  const url = new URL(location.href);
  if (selected) {
    url.searchParams.set('project', selected.id);
    url.searchParams.set('studio', '1');
  } else {
    url.searchParams.delete('project');
    url.searchParams.delete('studio');
  }
  if (currentCat && currentCat !== 'all') url.searchParams.set('cat', currentCat);
  else url.searchParams.delete('cat');
  history.replaceState({}, '', url);
  seenSearch = url.search;
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ project: selected?.id || null, cat: currentCat }),
  );
}

function resolveProjectId(raw) {
  if (!raw) return null;
  const key = String(raw).toLowerCase();
  return ALIAS[key] || key;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function stamp() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function resetLedger() {
  $('activity').replaceChildren();
}

function addLedger(title, detail) {
  const li = document.createElement('li');
  li.innerHTML = '<strong></strong><em></em>';
  li.querySelector('strong').textContent = title;
  li.querySelector('em').textContent = `${stamp()} · ${detail}`;
  $('activity').prepend(li);
}

function applyRoute() {
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat');
  if (cat && cat !== currentCat) {
    document.querySelectorAll('.filters button').forEach((b) => {
      b.classList.toggle('on', b.dataset.cat === cat);
    });
    setFilter(cat, { persist: false });
  }
  const openId = resolveProjectId(
    params.get('project') || (params.get('demo') === '1' ? 'demak' : null),
  );
  if (!openId) return;
  const hit = projects.find((p) => p.id === openId);
  if (hit && hit.id !== selected?.id) {
    openProject(hit);
    if (params.get('check') === '1') setTimeout(() => runCheck(), 400);
  }
}

async function load() {
  $('today').textContent = todayLabel();
  try {
    const res = await fetch('data/projects.json');
    const data = await res.json();
    projects = data.projects || [];
    const n = projects.length;
    const scenes = data.scenes || projects.reduce((a, p) => a + (p.scenes?.length || 0), 0);
    $('stats').textContent = `${n} sites · ${scenes} Sentinel-2 scenes · no login`;
    const params = new URLSearchParams(location.search);
    const session = readSession();
    const urlProject = params.get('project');
    const urlDemo = params.get('demo') === '1';
    const urlStudio = params.get('studio') === '1';
    const urlLocks = Boolean(urlProject || urlDemo);
    currentCat = params.get('cat') || (urlLocks ? 'all' : session.cat) || 'all';
    document.querySelectorAll('.filters button').forEach((b) => {
      b.classList.toggle('on', b.dataset.cat === currentCat);
    });
    setFilter(currentCat, { persist: false });
    try {
      buildGlobe();
    } catch (err) {
      console.warn('Globe failed; list still works.', err);
    }
    const openId = resolveProjectId(
      urlProject || (urlDemo ? 'demak' : null) || (urlLocks ? null : urlStudio ? 'demak' : session.project),
    );
    if (openId) {
      const hit = projects.find((p) => p.id === openId);
      if (hit) {
        openProject(hit);
        if (params.get('check') === '1') setTimeout(() => runCheck(), 400);
      }
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
      b.className = `${selected?.id === p.id ? 'on' : ''} ${isSaved(p.id) ? 'saved' : ''}`.trim();
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

function setFilter(cat, { persist = true } = {}) {
  currentCat = cat;
  if (cat === 'saved') {
    const saved = new Set(readSaved());
    filtered = projects.filter((p) => saved.has(p.id));
  } else {
    filtered = cat === 'all' ? projects : projects.filter((p) => p.category === cat);
  }
  renderList();
  if (globe) globe.pointsData(filtered).ringsData(filtered);
  if (persist) persistUrl();
}

function syncWatch() {
  const on = selected && isSaved(selected.id);
  $('watchBtn').textContent = on ? 'Saved' : 'Save';
  $('watchBtn').classList.toggle('on', Boolean(on));
}

function toggleWatch() {
  if (!selected) return;
  const ids = readSaved();
  const i = ids.indexOf(selected.id);
  if (i >= 0) ids.splice(i, 1);
  else ids.push(selected.id);
  writeSaved(ids);
  syncWatch();
  if (currentCat === 'saved') setFilter('saved');
  else renderList();
  addLedger(i >= 0 ? 'Removed from saved' : 'Saved locally', selected.name);
}

function openProject(p) {
  if (!p?.scenes?.length) {
    p = projects.find((x) => x.id === p?.id);
  }
  if (!p?.scenes?.length) return;
  selected = p;
  sceneIndex = p.scenes.length - 1;
  checking = false;
  lastManifest = null;
  lastSha = '';
  lastCheck = null;
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
  $('postCheck').hidden = true;
  $('manifest').hidden = true;
  $('signed').hidden = true;
  $('scan').classList.remove('on');
  $('grid').classList.remove('on');
  $('runBtn').disabled = false;
  $('runBtn').textContent = 'Run satellite check';
  syncWatch();
  resetLedger();
  addLedger('Opened archive', `${p.name} · ${p.scenes.length} Sentinel-2 scenes`);
  renderList();
  persistUrl();
  loadWeather(p);
  loadObservation(p);
  try {
    globe?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.4 }, 900);
  } catch {
    /* globe optional */
  }
}

function closeProject() {
  selected = null;
  detail.hidden = true;
  intro.hidden = false;
  renderList();
  persistUrl();
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

function drawObs(values) {
  const svg = $('obsChart');
  const w = 280;
  const h = 64;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * w;
      const y = h - 6 - ((v - min) / span) * (h - 12);
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  svg.replaceChildren();
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#69f0bd');
  path.setAttribute('stroke-width', '2');
  svg.appendChild(path);
}

function dailyMeans(times, series) {
  const buckets = new Map();
  times.forEach((t, i) => {
    const day = t.slice(0, 10);
    const v = series[i];
    if (v == null || Number.isNaN(v)) return;
    const cur = buckets.get(day) || { sum: 0, n: 0 };
    cur.sum += v;
    cur.n += 1;
    buckets.set(day, cur);
  });
  return [...buckets.entries()].map(([day, { sum, n }]) => ({ day, value: sum / n }));
}

async function loadObservation(p) {
  const box = $('obs');
  if (p.category !== 'reefs' && p.category !== 'energy') {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  $('obsCap').textContent = 'Fetching live observation…';
  $('obsChart').replaceChildren();
  try {
    if (p.category === 'reefs') {
      $('obsTitle').textContent = 'Sea surface temperature';
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${p.lat}&longitude=${p.lng}&hourly=sea_surface_temperature&past_days=7&forecast_days=1`;
      const d = await (await fetch(url)).json();
      const rows = dailyMeans(d.hourly.time, d.hourly.sea_surface_temperature);
      drawObs(rows.map((r) => r.value));
      const last = rows[rows.length - 1];
      $('obsCap').textContent = `Open-Meteo marine · ${last.value.toFixed(1)} °C on ${last.day} · observation only, not proof`;
    } else {
      $('obsTitle').textContent = 'Shortwave irradiance';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lng}&hourly=shortwave_radiation&past_days=7&forecast_days=1`;
      const d = await (await fetch(url)).json();
      const rows = dailyMeans(d.hourly.time, d.hourly.shortwave_radiation);
      drawObs(rows.map((r) => r.value));
      const last = rows[rows.length - 1];
      $('obsCap').textContent = `Open-Meteo · ${Math.round(last.value)} W/m² mean on ${last.day} · observation only, not proof`;
    }
  } catch {
    $('obsCap').textContent = 'Live observation delayed.';
  }
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

function buildManifest(p, liveDelta) {
  return {
    product: 'verdant-impact',
    schema: 'evidence-manifest/v1',
    project: {
      id: p.id,
      name: p.name,
      place: p.place,
      category: p.category,
      signal: p.signal,
      operator: p.operator,
      status: p.status,
    },
    scenes: p.scenes.map((s) => ({
      year: s.year,
      date: s.date,
      cloud: s.cloud,
      stacId: s.stacId,
      image: s.image,
      index: s.index,
    })),
    measurement: {
      baseline: p.baseline,
      current: p.current,
      packagedDelta: p.delta,
      liveDelta,
      progress: p.progress,
      unit: p.unit,
    },
    checkedAt: new Date().toISOString(),
    vault: { deployed: false, state: 'locked', note: 'No Solana program in this demo' },
    chain: { written: false, note: 'SHA-256 is computed locally and is not an on-chain transaction' },
  };
}

async function publishManifest(p, liveDelta) {
  lastManifest = buildManifest(p, liveDelta);
  const raw = JSON.stringify(lastManifest, null, 2);
  lastSha = await sha256(raw);
  $('manifest').textContent = raw;
  $('sha').textContent = `SHA-256 ${lastSha} · local only · not written to Solana`;
  $('postCheck').hidden = false;
  addLedger('Evidence manifest hashed', lastSha.slice(0, 16));
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
  $('postCheck').hidden = true;
  $('signed').hidden = true;
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
  try {
    const first = await raster(p.scenes[0].image);
    const last = await raster(p.scenes[p.scenes.length - 1].image);
    liveDelta = sampleIndex(last.imageData, p.signal) - sampleIndex(first.imageData, p.signal);
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
  lastCheck = { status: p.status, liveDelta };
  $('result').hidden = false;
  $('result').textContent = `${p.status}. Automatic check compared ${p.scenes[0].year} → ${p.scenes[p.scenes.length - 1].year} (${p.signal} index ${sign}${liveDelta.toFixed(3)}). No human review required for this readout. Vaults are not part of this demo.`;
  addLedger('Automatic check', `${p.status} · ${p.scenes[0].year} → ${p.scenes[p.scenes.length - 1].year}`);
  await publishManifest(p, liveDelta);
  btn.textContent = 'Run again';
  btn.disabled = false;
  checking = false;
}

function openSign() {
  if (!lastManifest) return;
  $('signName').value = $('signName').value || 'Demo reviewer';
  $('signDlg').showModal();
}

async function signDecision() {
  if (!lastManifest || !selected) return;
  const name = $('signName').value.trim() || 'Demo reviewer';
  const decision = document.querySelector('input[name="decision"]:checked')?.value || 'accept';
  const payload = {
    reviewer: name,
    decision,
    manifestSha: lastSha,
    project: selected.id,
    signedAt: new Date().toISOString(),
    vault: 'locked',
    note: 'Local signature. No backend. Funds do not move.',
  };
  const sig = await sha256(JSON.stringify(payload));
  $('signed').hidden = false;
  $('signed').textContent = `${name} · ${decision} · sig ${sig.slice(0, 16)} · vault remains locked`;
  addLedger(`${name} signed`, `${decision} · vault locked`);
  $('signDlg').close();
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
$('watchBtn').onclick = toggleWatch;
$('manifestBtn').onclick = () => {
  $('manifest').hidden = !$('manifest').hidden;
};
$('signOpen').onclick = openSign;
$('signCancel').onclick = () => $('signDlg').close();
$('signGo').onclick = signDecision;
window.addEventListener('resize', () => {
  if (globe && globeEl.clientWidth) globe.width(globeEl.clientWidth).height(globeEl.clientHeight);
});

load();
window.addEventListener('popstate', applyRoute);
window.addEventListener('pageshow', applyRoute);
setInterval(() => {
  if (location.search !== seenSearch) {
    seenSearch = location.search;
    applyRoute();
  }
}, 300);
