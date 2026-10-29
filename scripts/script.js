// Özikiler CNC Otomat — site etkileşimleri
document.documentElement.classList.add('js');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Ürün galerisi verisi
const PARTS = ['IMG_1070', 'IMG_1082', 'IMG_1115', 'IMG_1116', 'IMG_1138', 'IMG_1159', 'IMG_1189', 'IMG_1191', 'IMG_1196', 'IMG_1209', 'IMG_1212', 'IMG_1214', 'IMG_1218', 'IMG_1222', 'IMG_1224', 'IMG_1227', 'IMG_1229', 'IMG_1232', 'IMG_1236', 'IMG_1242', 'IMG_1246', 'IMG_1247', 'IMG_1250', 'IMG_1253', 'IMG_1255', 'IMG_1259', 'IMG_1261', 'IMG_1263', 'IMG_1272', 'IMG_1274', 'IMG_1276', 'IMG_1278', 'IMG_1284', 'IMG_1290', 'IMG_1295', 'IMG_1297', 'IMG_1298', 'IMG_1303', 'IMG_1305', 'IMG_1308', 'IMG_1310', 'IMG_1316', 'IMG_1319', 'IMG_1323', 'IMG_1325', 'IMG_1331', 'IMG_1336', 'IMG_1338', 'IMG_1340', 'IMG_1359', 'IMG_1361', 'IMG_1364', 'IMG_1375', 'IMG_1376', 'IMG_1378', 'IMG_1380', 'IMG_1383', 'IMG_1385'];
const PART_NAMES = { IMG_1070: 'Kanallı makara', IMG_1250: 'Yivli insert' };
const MACHINES = [
  { dir: 'kenar_kapama', t: 'Kenar kapama makinesi', files: ['IMG-20240922-WA0006', 'IMG-20240922-WA0007', 'IMG-20240922-WA0008'] },
  { dir: 'kablo_soguk_darbe_test', t: 'Kablo soğuk darbe test cihazı', files: ['IMG-20250508-WA0002', 'IMG-20250508-WA0003', 'IMG-20250508-WA0004', 'IMG-20250508-WA0005', 'IMG-20250508-WA0006'] },
  { dir: 'balcik_pompasi', t: 'Balçık pompası', files: ['20130414_172607', 'IMG_7957', 'IMG_7958', 'IMG_7959', '1', '2', '3', '4', 'IMG_7960', 'IMG_7961', 'IMG_7965', 'IMG_7968'] },
];

const parts = PARTS.map(f => ({ path: 'components/' + f, cat: 'part', t: PART_NAMES[f] || 'Otomat parçası' }));
const machines = MACHINES.flatMap(m => m.files.map(f => ({ path: `machines/${m.dir}/${f}`, cat: 'machine', t: m.t })));

// "Tümü" görünümünde makineler de ilk sayfada görünsün diye öne çıkanlar başa alınır
const FEATURED = ['machines/balcik_pompasi/IMG_7957', 'components/IMG_1250', 'components/IMG_1070', 'components/IMG_1082',
  'machines/kablo_soguk_darbe_test/IMG-20250508-WA0002', 'components/IMG_1115', 'components/IMG_1138', 'components/IMG_1189',
  'machines/kenar_kapama/IMG-20240922-WA0006', 'components/IMG_1212', 'components/IMG_1229', 'components/IMG_1274'];
const WIDE = new Set(['machines/balcik_pompasi/IMG_7957', 'machines/kenar_kapama/IMG-20240922-WA0006']);
const byPath = new Map([...parts, ...machines].map(i => [i.path, i]));
const allItems = [...FEATURED.map(p => byPath.get(p)), ...[...parts, ...machines].filter(i => !FEATURED.includes(i.path))];

const thumb = i => `assets/web/thumb/${i.path}.jpg`;
const large = i => `assets/web/large/${i.path}.jpg`;
const catName = { part: 'Otomat parçası', machine: 'Makine' };
const PAGE = 12;

const gallery = document.getElementById('gallery');
const moreBtn = document.getElementById('more');
let filter = 'all', visible = [], shown = PAGE;

function render() {
  visible = filter === 'all' ? allItems : allItems.filter(i => i.cat === filter);
  gallery.innerHTML = visible.slice(0, shown).map((i, n) => `
    <button class="tile${filter === 'all' && WIDE.has(i.path) ? ' wide' : ''}" data-i="${n}" aria-label="${i.t} görselini büyüt">
      <img src="${thumb(i)}" alt="${i.t}" loading="lazy">
      <span class="cap">${i.t}<span>${catName[i.cat]}</span></span>
    </button>`).join('');
  const left = visible.length - shown;
  moreBtn.hidden = left <= 0;
  moreBtn.textContent = `Daha fazla göster (${left})`;
}
['all', 'part', 'machine'].forEach(f => {
  document.getElementById('c-' + f).textContent = f === 'all' ? allItems.length : allItems.filter(i => i.cat === f).length;
});
document.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
  filter = b.dataset.f;
  shown = PAGE;
  document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === b));
  render();
}));
moreBtn.addEventListener('click', () => { shown += PAGE; render(); });
render();

// Lightbox: filtredeki tüm görseller arasında gezinir
const lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg');
let cur = 0, lastFocus = null;
function show(n) {
  cur = (n + visible.length) % visible.length;
  const it = visible[cur];
  lbImg.src = large(it); lbImg.alt = it.t;
  document.getElementById('lbCap').textContent = it.t;
  document.getElementById('lbCount').textContent = `${cur + 1} / ${visible.length}`;
}
gallery.addEventListener('click', e => {
  const t = e.target.closest('.tile'); if (!t) return;
  lastFocus = t; show(+t.dataset.i); lb.hidden = false; document.getElementById('lbX').focus();
});
function closeLb() { lb.hidden = true; lastFocus && lastFocus.focus(); }
document.getElementById('lbX').onclick = closeLb;
document.getElementById('lbPrev').onclick = () => show(cur - 1);
document.getElementById('lbNext').onclick = () => show(cur + 1);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowRight') show(cur + 1);
  if (e.key === 'ArrowLeft') show(cur - 1);
});

// Hero görsel geçişi
const slides = [...document.querySelectorAll('#stage img')];
const specs = [['Yivli insert', 'Paslanmaz · seri üretim'], ['Kanallı makara', 'Alüminyum · tornalama'], ['Otomat parçası', 'Çubuktan tek operasyon'], ['Otomat parçası', 'Hassas tornalama']];
const dots = document.getElementById('dots');
let slide = 0, timer;
slides.forEach((_, n) => {
  const d = document.createElement('button');
  d.setAttribute('aria-label', `Görsel ${n + 1}`);
  d.onclick = () => { go(n); restart(); };
  dots.appendChild(d);
});
function go(n) {
  slide = n;
  slides.forEach((s, k) => s.classList.toggle('on', k === n));
  [...dots.children].forEach((d, k) => d.classList.toggle('on', k === n));
  const [b, s] = specs[n];
  document.getElementById('spec').innerHTML = `<b>${b}</b>${s}`;
}
function restart() {
  clearInterval(timer);
  if (!reduceMotion) timer = setInterval(() => go((slide + 1) % slides.length), 4500);
}
go(0); restart();

// Üst menü: kaydırınca küçülme ve aktif bölüm
const header = document.querySelector('.header');
const links = [...document.querySelectorAll('.nav a:not(.btn)')];
const sections = links.map(a => document.querySelector(a.getAttribute('href')));
function onScroll() {
  header.classList.toggle('compact', scrollY > 40);
  let idx = 0;
  sections.forEach((s, k) => { if (s && s.getBoundingClientRect().top < 140) idx = k; });
  links.forEach((a, k) => a.classList.toggle('active', k === idx));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobil menü
const nav = document.getElementById('nav'), tog = document.getElementById('menuToggle');
tog.onclick = () => { const o = nav.classList.toggle('open'); tog.setAttribute('aria-expanded', o); };
nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); tog.setAttribute('aria-expanded', false); } });

// Ekranın altındaki bölümler hafifçe kayarak gelir
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pending'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pending'); io.observe(el); }
  });
}

// Sayaçlar
if (!reduceMotion) {
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count, start = end > 100 ? end - 40 : 0, t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / 1200), v = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v; if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

// Kopyala düğmeleri
document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
  const el = document.getElementById(b.dataset.copy);
  const done = () => { b.textContent = 'Kopyalandı'; setTimeout(() => b.textContent = 'Kopyala', 1600); };
  const select = () => { const r = document.createRange(); r.selectNodeContents(el); getSelection().removeAllRanges(); getSelection().addRange(r); };
  navigator.clipboard ? navigator.clipboard.writeText(el.textContent).then(done, select) : select();
}));

// Teklif formu: FormSubmit üzerinden e-postaya iletilir
const form = document.getElementById('quote');
const msg = document.getElementById('formMsg');
const fileIn = document.getElementById('f-file'), drop = document.querySelector('.drop');
const MAX_FILE = 10 * 1024 * 1024;
function setFile(file) { drop.innerHTML = file ? `<b>${file.name}</b> eklendi` : '<b>Dosya seçin</b> veya buraya sürükleyin · PDF, DWG, STEP'; }
fileIn.addEventListener('change', () => setFile(fileIn.files[0]));
drop.addEventListener('dragover', e => e.preventDefault());
drop.addEventListener('drop', e => {
  e.preventDefault();
  if (e.dataTransfer.files.length) { fileIn.files = e.dataTransfer.files; setFile(fileIn.files[0]); }
});
document.getElementById('f-next').value = location.href.split('#')[0] + '#tesekkurler';

form.addEventListener('submit', e => {
  const name = document.getElementById('f-name'), mail = document.getElementById('f-mail');
  let err = '';
  if (!name.value.trim()) err = 'Lütfen adınızı ve soyadınızı yazın.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim())) err = 'Lütfen geçerli bir e-posta adresi yazın.';
  else if (fileIn.files[0] && fileIn.files[0].size > MAX_FILE) err = 'Teknik resim dosyası 10 MB\'tan küçük olmalı.';
  if (err) {
    e.preventDefault();
    msg.style.color = 'var(--brand)';
    msg.textContent = err;
    (err.includes('adınızı') ? name : err.includes('e-posta') ? mail : drop).focus();
    return;
  }
  msg.style.color = '';
  msg.textContent = 'Gönderiliyor…';
});
if (location.hash === '#tesekkurler') {
  msg.textContent = 'Talebiniz bize ulaştı. En kısa sürede dönüş yapacağız.';
  document.getElementById('contact').scrollIntoView();
}
