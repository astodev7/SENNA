window.AURELIA = window.AURELIA || {};

window.AURELIA.API_BASE =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://senna-back.vercel.app/api';
