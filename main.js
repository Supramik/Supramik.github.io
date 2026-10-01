// Small enhancements; the page works without this file.
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function remember(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  // Light/dark toggle, remembered when storage is available.
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      remember('theme', root.dataset.theme);
    });
  }

  // Accent: Miku teal or pink.
  var accent = document.querySelector('.accent-toggle');
  if (accent) {
    var syncAccent = function () {
      var pink = root.dataset.accent === 'pink';
      accent.setAttribute('aria-pressed', pink);
      accent.querySelector('.sr').textContent = pink ? 'Use the teal accent' : 'Use the pink accent';
    };
    syncAccent();
    accent.addEventListener('click', function () {
      root.dataset.accent = root.dataset.accent === 'pink' ? 'teal' : 'pink';
      remember('accent', root.dataset.accent);
      syncAccent();
    });
  }

  // Motion: pause every animation, including the ticker.
  var motion = document.querySelector('.motion-toggle');
  if (motion) {
    if (!root.dataset.motion && reduced) root.dataset.motion = 'off';
    var syncMotion = function () {
      var off = root.dataset.motion === 'off';
      motion.setAttribute('aria-pressed', off);
      motion.querySelector('.sr').textContent = off ? 'Play animations' : 'Pause animations';
    };
    syncMotion();
    motion.addEventListener('click', function () {
      root.dataset.motion = root.dataset.motion === 'off' ? 'on' : 'off';
      remember('motion', root.dataset.motion);
      syncMotion();
    });
  }

  // Project filters.
  var buttons = document.querySelectorAll('.filters .chip-btn');
  var cards = document.querySelectorAll('#projects [data-tags]');
  var status = document.querySelector('.filter-status');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter, shown = 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
      cards.forEach(function (card) {
        var match = f === 'all' || card.dataset.tags.split(' ').indexOf(f) !== -1;
        var wasHidden = card.classList.contains('filtered-out');
        card.classList.toggle('filtered-out', !match);
        card.classList.toggle('just-shown', match && wasHidden);
        if (match) { shown++; card.classList.add('in'); }
      });
      status.textContent = f === 'all' ? '' : shown + (shown === 1 ? ' project' : ' projects');
    });
  });

  // Header border once the page scrolls.
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal sections, run the stat counters, and highlight the current nav link.
  var counted = new WeakSet();
  function countUp(el) {
    if (counted.has(el)) return;
    counted.add(el);
    var target = +el.dataset.count;
    if (reduced || root.dataset.motion === 'off') { el.textContent = target; return; }
    var start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revealer.observe(el); });

    var links = {};
    document.querySelectorAll('.site-header nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (link && entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Spotlight that follows the pointer on cards.
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
