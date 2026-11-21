/* dabloonery.com — the few things this page does.
   1. Show one pane at a time, from the address (#tirekick, #rules...)
   2. Theme choice   4. About dialog, with the changelog behind three presses on the mark
   5. Keyboard shortcuts (? lists them)   6. Real page load time in the banner   7. Tip box */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const root = document.documentElement;

  /* ---- 1. Panes ---- */
  const panes = [...document.querySelectorAll('.pane')];
  const links = [...document.querySelectorAll('.tabs a[data-pane]')];
  const show = (first) => {
    const id = location.hash.slice(1);
    const pane = panes.find((p) => p.id === id) || panes[0];
    panes.forEach((p) => p.classList.toggle('is-active', p === pane));
    links.forEach((a) => { if (a.dataset.pane === pane.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const content = $('#content');
    if (!first) {
      // Keep the tabs in view when switching from far down the page.
      const tabs = $('.tabs');
      if (tabs.getBoundingClientRect().top < 0) tabs.scrollIntoView({ block: 'start' });
      content.focus({ preventScroll: true });
    }
  };
  window.addEventListener('hashchange', () => show(false));
  show(true);

  /* ---- 2. Theme, remembered in this browser only ---- */
  const remember = (name, attr, key) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((r) => {
      r.checked = r.value === (root.dataset[attr] || r.value);
      r.addEventListener('change', () => {
        root.dataset[attr] = r.value;
        try { localStorage.setItem(key, r.value); } catch (e) { /* private window: fine */ }
      });
    });
  };
  remember('theme', 'theme', 'dabloonery.theme');

  /* ---- 3. (Copy email: back when there's an address.) ---- */

  /* ---- 4. About dialog ---- */
  let opener = null;
  document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => { opener = b; document.getElementById(b.dataset.open).showModal(); }));
  document.querySelectorAll('dialog').forEach((d) => {
    d.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => d.close()));
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => { if (opener) opener.focus(); });
  });

  const egg = $('#egg');
  const log = $('#log');
  let presses = 0, pressTimer;
  egg.addEventListener('click', () => {
    if (!log.hidden) { log.hidden = true; egg.setAttribute('aria-expanded', 'false'); return; }
    presses += 1;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => { presses = 0; }, 1200);
    if (presses >= 3) { presses = 0; log.hidden = false; egg.setAttribute('aria-expanded', 'true'); }
  });
  $('#about').addEventListener('close', () => { log.hidden = true; egg.setAttribute('aria-expanded', 'false'); presses = 0; });

  /* ---- 5. Keyboard shortcuts ---- */
  const ORDER = ['home', 'tirekick', 'rules', 'contact'];
  const current = () => (ORDER.includes(location.hash.slice(1)) ? location.hash.slice(1) : ORDER[0]);
  const go = (id) => { if (location.hash.slice(1) !== id) location.hash = id; };
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (document.querySelector('dialog[open]')) return; // Esc and Tab belong to the dialog
    if (e.key === '?') { e.preventDefault(); opener = document.activeElement; $('#keys').showModal(); return; }
    const n = Number(e.key);
    if (n >= 1 && n <= ORDER.length) { go(ORDER[n - 1]); return; }
    if (e.key === 'j' || e.key === 'k') {
      const i = ORDER.indexOf(current());
      go(ORDER[(i + (e.key === 'j' ? 1 : -1) + ORDER.length) % ORDER.length]);
    }
  });

  /* ---- 6. How fast this page loaded, measured, not made up ---- */
  const showLoad = () => {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const ms = nav && nav.domContentLoadedEventEnd ? nav.domContentLoadedEventEnd : performance.now();
    $('#load-time').textContent = `${Math.max(1, Math.round(ms))} ms`;
  };
  if (document.readyState === 'complete') showLoad(); else window.addEventListener('load', showLoad);

  /* ---- 7. Tips: every tip once, in a shuffled order, then a new round. Keyboard tips only where there's a keyboard. ---- */
  const keyboard = window.matchMedia('(hover: hover)').matches;
  const TIPS = [
    ['Press <kbd>?</kbd> to see every keyboard shortcut.', true],
    ['<kbd>j</kbd> and <kbd>k</kbd> move to the next and previous tab.', true],
    ['Tirekick can check Craigslist too. Switch it on in its settings.'],
    ["Tirekick's AI is off until you add your own API key or point it at a model on your computer."],
    ['Reseller mode in Tirekick works out what something will sell for after repairs.'],
    ['Tirekick only reads pages you have open. It never opens or crawls a marketplace page by itself.'],
    ['Your theme choice is saved in this browser only. This site sets no cookies.'],
    ['The load time in the banner is measured in your browser each visit, not made up.'],
    ['Press the mark in the About box three times.'],
  ].filter(([, needsKeys]) => keyboard || !needsKeys).map(([t]) => t);
  const tipEl = $('#tip');
  const nextTip = $('#next-tip');
  let deck = [];
  const deal = () => {
    if (!deck.length) {
      deck = TIPS.map((t, i) => i).sort(() => Math.random() - 0.5);
      if (TIPS[deck[0]] === tipEl.innerHTML) deck.push(deck.shift()); // never the same tip twice in a row
    }
    tipEl.innerHTML = TIPS[deck.shift()];
  };
  deal();
  nextTip.hidden = false;
  nextTip.addEventListener('click', deal);
})();
