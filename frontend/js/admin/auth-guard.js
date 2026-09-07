(async function () {
  if (location.pathname.includes('login.html')) return;
  try {
    await (window.AURELIA?.api || { get: () => fetch('/api/admin/auth/me', { credentials: 'include' }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }) }).get('/admin/auth/me');
  } catch {
    location.href = '/admin/login.html';
  }
})();
