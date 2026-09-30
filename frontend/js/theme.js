(function () {
  const STORAGE_KEY = 'aurelia-theme';

  function apply(theme) {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#F1EEE6' : '#080908';
  }

  function current() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }

  apply(current());

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle], [data-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = document.documentElement.classList.contains('light') ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEY, next);
        apply(next);
      });
    });
  });
})();
