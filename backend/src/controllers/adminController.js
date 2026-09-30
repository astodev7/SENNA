'use strict';

const authService = require('../services/authService');
const projectService = require('../services/projectService');
const planService = require('../services/planService');
const contactService = require('../services/contactService');
const faqService = require('../services/faqService');
const dashboardService = require('../services/dashboardService');
const settingsService = require('../services/settingsService');

const isProd = process.env.NODE_ENV === 'production';

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'E-mail e senha são obrigatórios.' },
      });
    }
    const result = await authService.login(email, password, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.cookie('aurelia_session', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      data: { user: result.user },
      message: 'Login realizado.',
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    if (req.sessionId) {
      await authService.logout(req.sessionId, req.user?.id, { ip: req.ip });
    }
    res.clearCookie('aurelia_session', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });
    res.json({ message: 'Logout realizado.' });
  } catch (err) {
    next(err);
  }
}

async function dashboard(req, res, next) {
  try {
    const stats = await dashboardService.getStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
}

async function listContacts(req, res, next) {
  try {
    const result = await contactService.listAdmin({
      status: req.query.status,
      search: req.query.search,
      limit: parseInt(req.query.limit, 10) || 50,
      offset: parseInt(req.query.offset, 10) || 0,
    });
    res.json({ data: result.items, total: result.total });
  } catch (err) {
    next(err);
  }
}

async function getContact(req, res, next) {
  try {
    const contact = await contactService.getById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Lead não encontrado.' } });
    }
    res.json({ data: contact });
  } catch (err) {
    next(err);
  }
}

async function updateContact(req, res, next) {
  try {
    const contact = await contactService.updateStatus(
      req.params.id,
      req.body.status,
      req.body.notes,
      req.user.id
    );
    if (!contact) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Lead não encontrado.' } });
    }
    res.json({ data: contact });
  } catch (err) {
    next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    const projects = await projectService.listAdmin();
    res.json({ data: projects });
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await projectService.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Projeto não encontrado.' } });
    }
    res.json({ data: project });
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const project = await projectService.create(req.body, req.user.id);
    res.status(201).json({ data: project });
  } catch (err) {
    if (err.code === '23505') {
      err.status = 409;
      err.message = 'Slug já existe.';
    }
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const project = await projectService.update(req.params.id, req.body, req.user.id);
    if (!project) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Projeto não encontrado.' } });
    }
    res.json({ data: project });
  } catch (err) {
    if (err.code === '23505') {
      err.status = 409;
      err.message = 'Slug já existe.';
    }
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const ok = await projectService.remove(req.params.id, req.user.id);
    if (!ok) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Projeto não encontrado.' } });
    }
    res.json({ message: 'Projeto removido.' });
  } catch (err) {
    next(err);
  }
}

async function listPlans(req, res, next) {
  try {
    const plans = await planService.listAdmin();
    res.json({ data: plans });
  } catch (err) {
    next(err);
  }
}

async function getPlan(req, res, next) {
  try {
    const plan = await planService.getById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Plano não encontrado.' } });
    }
    res.json({ data: plan });
  } catch (err) {
    next(err);
  }
}

async function createPlan(req, res, next) {
  try {
    const plan = await planService.create(req.body, req.user.id);
    res.status(201).json({ data: plan });
  } catch (err) {
    if (err.code === '23505') {
      err.status = 409;
      err.message = 'Slug já existe.';
    }
    next(err);
  }
}

async function updatePlan(req, res, next) {
  try {
    const plan = await planService.update(req.params.id, req.body, req.user.id);
    if (!plan) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Plano não encontrado.' } });
    }
    res.json({ data: plan });
  } catch (err) {
    next(err);
  }
}

async function deletePlan(req, res, next) {
  try {
    const ok = await planService.remove(req.params.id, req.user.id);
    if (!ok) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Plano não encontrado.' } });
    }
    res.json({ message: 'Plano removido.' });
  } catch (err) {
    next(err);
  }
}

async function listFaqs(req, res, next) {
  try {
    const faqs = await faqService.listAdmin();
    res.json({ data: faqs });
  } catch (err) {
    next(err);
  }
}

async function createFaq(req, res, next) {
  try {
    const faq = await faqService.create(req.body, req.user.id);
    res.status(201).json({ data: faq });
  } catch (err) {
    next(err);
  }
}

async function updateFaq(req, res, next) {
  try {
    const faq = await faqService.update(req.params.id, req.body);
    if (!faq) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'FAQ não encontrado.' } });
    }
    res.json({ data: faq });
  } catch (err) {
    next(err);
  }
}

async function deleteFaq(req, res, next) {
  try {
    const ok = await faqService.remove(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'FAQ não encontrado.' } });
    }
    res.json({ message: 'FAQ removido.' });
  } catch (err) {
    next(err);
  }
}

async function getSettings(req, res, next) {
  try {
    const settings = await settingsService.getAll();
    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await settingsService.update(req.body, req.user.id);
    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ data: { user: req.user } });
}

module.exports = {
  login,
  logout,
  me,
  dashboard,
  listContacts,
  getContact,
  updateContact,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getSettings,
  updateSettings,
};
