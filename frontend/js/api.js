(function () {
  const base = () => (window.AURELIA && window.AURELIA.API_BASE) || '/api';

  async function request(path, options = {}) {
    const url = path.startsWith('http') ? path : `${base()}${path}`;
    const opts = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    };
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.body = JSON.stringify(opts.body);
    }

    const res = await fetch(url, opts);
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await res.json();
    }

    if (!res.ok) {
      const err = new Error((data && data.error && data.error.message) || res.statusText || 'Erro na requisição');
      err.status = res.status;
      err.code = data?.error?.code;
      err.data = data;
      throw err;
    }
    return data;
  }

  window.AURELIA = window.AURELIA || {};
  window.AURELIA.api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    delete: (path) => request(path, { method: 'DELETE' }),
  };
})();
