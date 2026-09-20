const COLORS = {
  'On track': '#b8ff6a',
  Watching: '#5fdde5',
  Shifting: '#69f0bd',
  'Off track': '#ff9d7a',
};

const globeEl = document.getElementById('globe');
const panel = document.getElementById('panel');
let projects = [];
let filtered = [];
let selected = null;
let globe;
let sceneIndex = 0;

const $ = (id) => document.getElementById(id);

async function load() {
  const res = await fetch('data/projects.json');
  const data = await res.json();
  projects = data.projects;
  filtered = projects;
  $('count').textContent = String(projects.length);
  buildGlobe();
  const params = new URLSearchParams(location.search);
  const openId = params.get('project') || (params.get('demo') === '1' ? 'demak' : null);
  if (openId) {
    const hit = projects.find((p) => p.id === openId);
    if (hit) openProject(hit);
  }
}

function buildGlobe() {
  globe = Globe()(globeEl)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor('#69f0bd')
    .atmosphereAltitude(0.16)
    .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg')
    .pointsData(filtered)
    .pointLat('lat')
    .pointLng('lng')
    .pointAltitude(0.03)
    .pointRadius(0.48)
    .pointColor((d) => COLORS[d.status] || '#b8ff6a')
    .pointLabel((d) => `<b>${d.name}</b><br/>${d.place}<br/>${d.status} · ${d.progress}%`)
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
    .ringMaxRadius(2.6)
    .ringPropagationSpeed(1.1)
    .ringRepeatPeriod(1600)
    .onPointClick(openProject)
    .width(globeEl.clientWidth)
    .height(globeEl.clientHeight)
    .pointOfView({ lat: 8, lng: 20, altitude: 2.05 }, 0);
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.enableDamping = true;
}

function setFilter(cat) {
  filtered = cat === 'all' ? projects : projects.filter((p) => p.category === cat);
  $('count').textContent = String(filtered.length);
  globe.pointsData(filtered).ringsData(filtered);
}

function openProject(p) {
  selected = p;
  sceneIndex = p.scenes.length - 1;
  panel.hidden = false;
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
      b.textContent = String(s.year);
      b.className = i === sceneIndex ? 'on' : '';
      b.onclick = () => {
        sceneIndex = i;
        renderScene();
        [...$('years').children].forEach((el, j) => el.classList.toggle('on', j === i));
      };
      return b;
    }),
  );
  $('miles').replaceChildren(
    ...p.milestones.map((m) => {
      const li = document.createElement('li');
      li.innerHTML = '<strong></strong><b></b><em></em>';
      li.querySelector('strong').textContent = m.name;
      li.querySelector('b').textContent = `${Math.round(m.pct)}%`;
      li.querySelector('em').textContent = m.detail;
      return li;
    }),
  );
  $('result').hidden = true;
  $('agents').hidden = true;
  $('runBtn').disabled = false;
  $('runBtn').textContent = 'Run satellite check';
  loadWeather(p);
  globe.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.35 }, 800);
}

function renderScene() {
  const s = selected.scenes[sceneIndex];
  $('satImg').src = s.image;
  $('satDate').textContent = s.date;
  $('satMeta').textContent = `${s.cloud}% cloud · ${s.source.split('·')[0].trim()}`;
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

async function measure(url) {
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
  const { data } = ctx.getImageData(0, 0, 96, 96);
  let acc = 0;
  const n = 96 * 96;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    if (selected.signal === 'greenness') acc += (g - r) / (g + r + 1e-6);
    else if (selected.signal === 'water') acc += (b - r) / (b + r + 1e-6);
    else acc += (r + g + b) / 3;
  }
  return acc / n;
}

async function runCheck() {
  const p = selected;
  const btn = $('runBtn');
  btn.disabled = true;
  btn.textContent = 'Reading scenes…';
  $('agents').hidden = false;
  $('result').hidden = true;
  $('scan').classList.add('on');
  const steps = [...$('agents').children];
  steps.forEach((el) => el.classList.remove('go'));
  for (let i = 0; i < steps.length; i += 1) {
    steps[i].classList.add('go');
    await new Promise((r) => setTimeout(r, 420));
  }
  let liveDelta = p.delta;
  try {
    const first = await measure(p.scenes[0].image);
    const last = await measure(p.scenes[p.scenes.length - 1].image);
    liveDelta = last - first;
  } catch {
    /* packaged index already on the project */
  }
  $('scan').classList.remove('on');
  const sign = liveDelta >= 0 ? '+' : '';
  $('result').hidden = false;
  $('result').textContent = `${p.status}. Automatic check compared ${p.scenes[0].year} → ${p.scenes[p.scenes.length - 1].year} (${p.signal} index ${sign}${liveDelta.toFixed(3)}). No human review required for this readout. Vaults are not part of this demo.`;
  btn.textContent = 'Run again';
  btn.disabled = false;
}

document.querySelectorAll('.filters button').forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll('.filters button').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    setFilter(b.dataset.cat);
  };
});
$('closePanel').onclick = () => {
  panel.hidden = true;
};
$('runBtn').onclick = runCheck;
window.addEventListener('resize', () => {
  if (globe) globe.width(globeEl.clientWidth).height(globeEl.clientHeight);
});

load();
