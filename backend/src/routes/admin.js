'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
    },
  },
});

router.post('/auth/login', loginLimiter, ctrl.login);
router.post('/auth/logout', requireAuth, ctrl.logout);
router.get('/auth/me', requireAuth, ctrl.me);

router.get('/dashboard', requireAuth, ctrl.dashboard);

router.get('/contacts', requireAuth, ctrl.listContacts);
router.get('/contacts/:id', requireAuth, ctrl.getContact);
router.patch('/contacts/:id', requireAuth, ctrl.updateContact);

router.get('/projects', requireAuth, ctrl.listProjects);
router.get('/projects/:id', requireAuth, ctrl.getProject);
router.post('/projects', requireAuth, requireRole('admin', 'editor'), ctrl.createProject);
router.put('/projects/:id', requireAuth, requireRole('admin', 'editor'), ctrl.updateProject);
router.delete('/projects/:id', requireAuth, requireRole('admin'), ctrl.deleteProject);

router.get('/plans', requireAuth, ctrl.listPlans);
router.get('/plans/:id', requireAuth, ctrl.getPlan);
router.post('/plans', requireAuth, requireRole('admin'), ctrl.createPlan);
router.put('/plans/:id', requireAuth, requireRole('admin'), ctrl.updatePlan);
router.delete('/plans/:id', requireAuth, requireRole('admin'), ctrl.deletePlan);

router.get('/faqs', requireAuth, ctrl.listFaqs);
router.post('/faqs', requireAuth, requireRole('admin', 'editor'), ctrl.createFaq);
router.put('/faqs/:id', requireAuth, requireRole('admin', 'editor'), ctrl.updateFaq);
router.delete('/faqs/:id', requireAuth, requireRole('admin'), ctrl.deleteFaq);

router.get('/settings', requireAuth, requireRole('admin'), ctrl.getSettings);
router.put('/settings', requireAuth, requireRole('admin'), ctrl.updateSettings);

module.exports = router;
