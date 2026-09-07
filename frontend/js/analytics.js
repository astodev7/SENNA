(function () {
  const queue = [];
  const handlers = [];

  function track(event, props = {}) {
    const payload = {
      event,
      props,
      ts: new Date().toISOString(),
      path: location.pathname,
    };
    queue.push(payload);
    handlers.forEach((h) => {
      try {
        h(payload);
      } catch (_) {}
    });
    // Ready for GA / Plausible / PostHog integration
    if (window.plausible) {
      try {
        window.plausible(event, { props });
      } catch (_) {}
    }
  }

  function onTrack(fn) {
    if (typeof fn === 'function') handlers.push(fn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    track('page_view');

    document.querySelectorAll('[data-track]').forEach((el) => {
      el.addEventListener('click', () => {
        track(el.getAttribute('data-track') || 'click', {
          label: el.getAttribute('data-track-label') || el.textContent?.trim()?.slice(0, 60),
        });
      });
    });
  });

  window.AURELIA = window.AURELIA || {};
  window.AURELIA.analytics = { track, onTrack, queue };
})();
