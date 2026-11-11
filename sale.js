// Распродажа 11.11: −30% до 12.11.2026 00:00 МСК (= 11.11 21:00 UTC).
// Базовый HTML — обычные цены. Скрипт включает скидку только до дедлайна
// и сам возвращает обычные цены, когда время вышло.
(() => {
  const SALE = {
    end: Date.UTC(2026, 10, 11, 21, 0, 0),
    rub: { old: '1200 ₽', now: '840 ₽', href: 'ROBOKASSA_SALE_LINK' },
    usd: { old: '$14', now: '$9.80' },
    code: 'PAYHIP_CODE',
  };
  if (Date.now() >= SALE.end) return;

  const en = document.documentElement.lang === 'en';
  const text = en
    ? { title: '11.11 SALE · 30% OFF', left: 'ENDS IN' }
    : { title: '11.11 · −30% НА TYPE/01 · ДО 00:00 МСК', left: 'ОСТАЛОСЬ' };

  const restore = [];
  const swap = (el, prop, value) => { restore.push([el, prop, el[prop]]); el[prop] = value; };

  document.querySelectorAll('[data-price]').forEach((el) => {
    const p = SALE[el.dataset.price];
    if (p) swap(el, 'innerHTML', `<s class="old-price">${p.old}</s> ${p.now}`);
  });
  document.querySelectorAll('[data-sale-href="rub"]').forEach((el) => swap(el, 'href', SALE.rub.href));
  document.querySelectorAll('[data-sale-code]').forEach((el) => { el.textContent = SALE.code; });
  document.querySelectorAll('[data-sale-note]').forEach((el) => swap(el, 'hidden', false));

  const bar = document.createElement('div');
  bar.className = 'sale-bar';
  bar.innerHTML = `<div class="wrap"><span>${text.title}</span><span>${text.left} <b class="sale-timer">--:--:--</b></span></div>`;
  document.body.prepend(bar);
  const timer = bar.querySelector('.sale-timer');

  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const ms = SALE.end - Date.now();
    if (ms <= 0) {
      clearInterval(id);
      restore.reverse().forEach(([el, prop, value]) => { el[prop] = value; });
      bar.remove();
      return;
    }
    const s = Math.floor(ms / 1000);
    timer.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  const id = setInterval(tick, 1000);
  tick();
})();
