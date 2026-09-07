'use strict';

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const isProd = process.env.NODE_ENV === 'production';
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
          },
        }
      : false,
  })
);

app.use(
  cors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());

if (!isProd) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend
const frontendPath = path.resolve(__dirname, '../../frontend');
app.use(
  express.static(frontendPath, {
    maxAge: isProd ? '1d' : 0,
    etag: true,
  })
);

// SPA-like fallback for admin and project pages
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin', 'index.html'), (err) => {
    if (err) res.status(404).sendFile(path.join(frontendPath, '404.html'));
  });
});

app.get('/projetos/:slug', (req, res) => {
  res.sendFile(path.join(frontendPath, 'projetos', 'case.html'), (err) => {
    if (err) res.status(404).sendFile(path.join(frontendPath, '404.html'));
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
