'use strict';

const projectService = require('../services/projectService');
const planService = require('../services/planService');
const contactService = require('../services/contactService');
const faqService = require('../services/faqService');
const { pool } = require('../database/pool');

async function health(req, res, next) {
  try {
    let db = 'ok';
    try {
      await pool.query('SELECT 1');
    } catch {
      db = 'error';
    }
    res.json({
      status: db === 'ok' ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      version: '1.0.0',
      database: db,
    });
  } catch (err) {
    next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    const projects = await projectService.listPublic({
      category: req.query.category,
      featured: req.query.featured,
    });
    res.json({ data: projects });
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await projectService.getBySlug(req.params.slug);
    if (!project) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Projeto não encontrado.' },
      });
    }
    res.json({ data: project });
  } catch (err) {
    next(err);
  }
}

async function listPlans(req, res, next) {
  try {
    const plans = await planService.listPublic();
    res.json({ data: plans });
  } catch (err) {
    next(err);
  }
}

async function listFaqs(req, res, next) {
  try {
    const faqs = await faqService.listPublic();
    res.json({ data: faqs });
  } catch (err) {
    next(err);
  }
}

async function createContact(req, res, next) {
  try {
    const result = await contactService.create(req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    res.status(201).json({ data: result, message: 'Mensagem recebida. Entraremos em contato em breve.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  health,
  listProjects,
  getProject,
  listPlans,
  listFaqs,
  createContact,
};
