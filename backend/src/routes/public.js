'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/publicController');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Muitas solicitações. Tente novamente em alguns minutos.',
    },
  },
});

router.get('/health', ctrl.health);
router.get('/projects', ctrl.listProjects);
router.get('/projects/:slug', ctrl.getProject);
router.get('/plans', ctrl.listPlans);
router.get('/faqs', ctrl.listFaqs);
router.post('/contact', contactLimiter, ctrl.createContact);

module.exports = router;
