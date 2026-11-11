// ─── Скидка на Type/01 ─────────────────────────────────────────────────────
// Как запустить новую скидку — поменять только блок SALE:
//   start / end  — начало и конец (время с поясом, +03:00 = МСК);
//   percent      — размер скидки, цены пересчитываются сами;
//   name         — подпись в начале плашки (можно '' — тогда без неё);
//   robokassa    — ссылка Робокассы на сумму со скидкой. Пока её нет,
//                  рублёвая цена на сайте не меняется.
// Ещё нужно: та же скидка в Payhip (Sale на товаре) и MIN_SUM в Worker
// автовыдачи не выше рублёвой цены со скидкой.
// Вне периода start–end скрипт ничего не трогает: сайт показывает обычные цены.
// ───────────────────────────────────────────────────────────────────────────
const SALE = {
  start: '2026-11-11T00:00:00+03:00',
  end: '2026-11-12T00:00:00+03:00',
  percent: 30,
  name: '11.11',
  robokassa: '',
};
const PRICE = { rub: 1200, usd: 14 };

(() => {
  const start = Date.parse(SALE.start);
  const end = Date.parse(SALE.end);
  if (!(Date.now() >= start && Date.now() < end)) return;

  const en = document.documentElement.lang === 'en';
  const k = 1 - SALE.percent / 100;
  const prices = {
    rub: SALE.robokassa && { old: `${PRICE.rub} ₽`, now: `${Math.round(PRICE.rub * k)} ₽` },
    usd: { old: `$${PRICE.usd}`, now: `$${(PRICE.usd * k).toFixed(2).replace(/\.00$/, '')}` },
  };

  // «до 00:00 МСК» для однодневной скидки, «до 15.11 00:00 МСК» для длинной.
  const msk = new Date(end + 3 * 3600e3);
  const pad = (n) => String(n).padStart(2, '0');
  const hhmm = `${pad(msk.getUTCHours())}:${pad(msk.getUTCMinutes())}`;
  const until = end - start <= 864e5 ? hhmm : `${pad(msk.getUTCDate())}.${pad(msk.getUTCMonth() + 1)} ${hhmm}`;
  const pre = SALE.name ? `${SALE.name} · ` : '';
  const text = en
    ? { title: `${pre}SALE · ${SALE.percent}% OFF`, left: 'ENDS IN', day: 'D' }
    : { title: `${pre}−${SALE.percent}% НА TYPE/01 · ДО ${until} МСК`, left: 'ОСТАЛОСЬ', day: 'Д' };

  const restore = [];
  const swap = (el, prop, value) => { restore.push([el, prop, el[prop]]); el[prop] = value; };

  document.querySelectorAll('[data-price]').forEach((el) => {
    const p = prices[el.dataset.price];
    if (p) swap(el, 'innerHTML', `<s class="old-price">${p.old}</s> ${p.now}`);
  });
  if (SALE.robokassa) {
    document.querySelectorAll('[data-sale-href="rub"]').forEach((el) => swap(el, 'href', SALE.robokassa));
  }
  document.querySelectorAll('[data-sale-note]').forEach((el) => {
    swap(el, 'textContent', ` · −${SALE.percent}%`);
    swap(el, 'hidden', false);
  });

  const bar = document.createElement('div');
  bar.className = 'sale-bar';
  bar.innerHTML = `<div class="wrap"><span>${text.title}</span><span>${text.left} <b class="sale-timer"></b></span></div>`;
  document.body.prepend(bar);
  const timer = bar.querySelector('.sale-timer');

  let id;
  const tick = () => {
    const ms = end - Date.now();
    if (ms <= 0) {
      clearInterval(id);
      restore.reverse().forEach(([el, prop, value]) => { el[prop] = value; });
      bar.remove();
      return;
    }
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const hms = `${pad(Math.floor(s / 3600) % 24)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
    timer.textContent = d ? `${d} ${text.day} ${hms}` : hms;
  };
  id = setInterval(tick, 1000);
  tick();
})();
