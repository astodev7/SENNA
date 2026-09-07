'use strict';

const bcrypt = require('bcryptjs');
const { pool } = require('./pool');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    // Admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aurelia.com.br';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const adminName = process.env.ADMIN_NAME || 'Administrador';

    const { rows: existing } = await client.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [adminEmail]
    );

    if (existing.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await client.query(
        `INSERT INTO admin_users (email, password_hash, name, role)
         VALUES ($1, $2, $3, 'admin')`,
        [adminEmail, hash, adminName]
      );
      console.log(`  Admin created: ${adminEmail}`);
    } else {
      console.log('  Admin already exists, skipping.');
    }

    // Projects
    const projects = [
      {
        slug: 'brasa',
        title: 'BRASA',
        category: 'Web',
        summary: 'Cardápio digital, experiência mobile e sistema de pedidos para restaurante.',
        description: 'A BRASA precisava de uma presença digital que refletisse a qualidade da cozinha e simplificasse o fluxo de pedidos.',
        problem: 'Processo de pedidos fragmentado, cardápio estático e baixa conversão mobile.',
        context: 'Restaurante contemporâneo com alta demanda em horário de pico e forte presença local.',
        solution: 'Experiência digital unificada: cardápio interativo, pedidos online e painel de gestão operacional.',
        architecture: 'Frontend estático de alta performance + API de pedidos + integração com sistema de cozinha.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'PostgreSQL'],
        results: 'Fluxo de pedidos mais fluido e experiência mobile consistente. Operação de pedidos mais fluida e experiência mobile consistente.',
        is_published: true,
        is_featured: true,
        sort_order: 1,
        meta_title: 'BRASA — Projeto AURELIA',
        meta_description: 'Cardápio digital e sistema de pedidos desenvolvidos pela AURELIA.',
      },
      {
        slug: 'atlas',
        title: 'ATLAS',
        category: 'Web',
        summary: 'Site institucional focado em autoridade e conversão para escritório de advocacia.',
        description: 'A ATLAS precisava de um site que comunicasse seriedade, clareza e capacidade de conversão de leads qualificados.',
        problem: 'Presença digital genérica, baixa autoridade visual e formulários pouco eficazes.',
        context: 'Escritório de advocacia com atuação em áreas estratégicas e público exigente.',
        solution: 'Site institucional editorial, hierarquia clara de conteúdo e captura de leads estruturada.',
        architecture: 'Arquitetura de conteúdo semântica + formulários protegidos + SEO técnico.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'Express'],
        results: 'Maior clareza na comunicação e melhor estruturação de leads. Melhor estruturação da jornada de leads e comunicação institucional.',
        is_published: true,
        is_featured: true,
        sort_order: 2,
        meta_title: 'ATLAS — Projeto AURELIA',
        meta_description: 'Site institucional de advocacia desenvolvido pela AURELIA.',
      },
      {
        slug: 'lumiere',
        title: 'LUMIERE',
        category: 'Sistemas',
        summary: 'Experiência digital premium para produto tecnológico.',
        description: 'A LUMIERE precisava de uma interface que transmitisse precisão técnica e sofisticação de produto.',
        problem: 'Comunicação de produto complexa e falta de coerência entre marketing e produto.',
        context: 'Empresa de tecnologia com produto B2B de alto valor e ciclo de decisão longo.',
        solution: 'Experiência digital premium com narrativa clara, demos interativas e arquitetura de conteúdo.',
        architecture: 'Frontend de performance + camada de conteúdo + integrações de analytics.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'APIs'],
        results: 'Narrativa de produto mais clara e experiência alinhada à marca. Resultado alinhado aos objetivos definidos no projeto.',
        is_published: true,
        is_featured: true,
        sort_order: 3,
        meta_title: 'LUMIERE — Projeto AURELIA',
        meta_description: 'Experiência digital premium desenvolvida pela AURELIA.',
      },
      {
        slug: 'nexus',
        title: 'NEXUS',
        category: 'Automação',
        summary: 'Automação de fluxos operacionais e integração entre sistemas internos.',
        description: 'Redução de trabalho manual e conexão entre ferramentas de operação.',
        problem: 'Processos manuais repetitivos e dados isolados entre sistemas.',
        context: 'Empresa com múltiplas ferramentas e equipe operacional sobrecarregada.',
        solution: 'Camada de automação e integrações sob medida.',
        architecture: 'Orquestração de fluxos + APIs + monitoramento.',
        technologies: ['Node.js', 'PostgreSQL', 'APIs', 'Webhooks'],
        results: 'Redução de tarefas manuais e maior consistência de dados. Resultado alinhado aos objetivos definidos no projeto.',
        is_published: true,
        is_featured: false,
        sort_order: 4,
        meta_title: 'NEXUS — Projeto AURELIA',
        meta_description: 'Automação e integrações pela AURELIA.',
      },
      {
        slug: 'vertex',
        title: 'VERTEX',
        category: 'IA',
        summary: 'Camada de inteligência artificial integrada a fluxos de atendimento.',
        description: 'IA aplicada a classificação e roteamento de demandas.',
        problem: 'Volume alto de solicitações e classificação manual lenta.',
        context: 'Operação de atendimento com necessidade de priorização inteligente.',
        solution: 'Modelos de classificação integrados ao fluxo existente.',
        architecture: 'Pipeline de dados + modelo + API de inferência.',
        technologies: ['Python', 'Node.js', 'APIs', 'PostgreSQL'],
        results: 'Classificação mais rápida e consistente. Resultado alinhado aos objetivos definidos no projeto.',
        is_published: true,
        is_featured: false,
        sort_order: 5,
        meta_title: 'VERTEX — Projeto AURELIA',
        meta_description: 'IA aplicada a fluxos pela AURELIA.',
      },
    ];

    for (const p of projects) {
      const { rows } = await client.query('SELECT id FROM projects WHERE slug = $1', [p.slug]);
      if (rows.length === 0) {
        await client.query(
          `INSERT INTO projects (
            slug, title, category, summary, description, problem, context, solution,
            architecture, technologies, results, is_published, is_featured, sort_order,
            meta_title, meta_description
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [
            p.slug, p.title, p.category, p.summary, p.description, p.problem, p.context,
            p.solution, p.architecture, p.technologies, p.results, p.is_published,
            p.is_featured, p.sort_order, p.meta_title, p.meta_description,
          ]
        );
        console.log(`  Project: ${p.title}`);
      }
    }

    // Plans
    const plans = [
      {
        slug: 'essential',
        name: 'ESSENTIAL',
        tagline: 'Presença digital profissional.',
        description: 'Site institucional claro, rápido e preparado para SEO.',
        price_label: 'Sob consulta',
        price_value: null,
        is_active: true,
        is_featured: false,
        sort_order: 1,
        features: [
          { key: 'pages', label: 'Páginas', value: 'Até 6', included: true },
          { key: 'support', label: 'Suporte', value: 'E-mail', included: true },
          { key: 'seo', label: 'SEO técnico', value: 'Básico', included: true },
          { key: 'integrations', label: 'Integrações', value: '—', included: false },
          { key: 'automation', label: 'Automação', value: '—', included: false },
          { key: 'ai', label: 'IA', value: '—', included: false },
          { key: 'analytics', label: 'Analytics', value: 'Básico', included: true },
          { key: 'maintenance', label: 'Manutenção', value: 'Opcional', included: true },
          { key: 'custom', label: 'Desenvolvimento personalizado', value: 'Limitado', included: true },
        ],
      },
      {
        slug: 'growth',
        name: 'GROWTH',
        tagline: 'Presença + automação.',
        description: 'Site + automações leves e integrações essenciais.',
        price_label: 'Sob consulta',
        price_value: null,
        is_active: true,
        is_featured: true,
        sort_order: 2,
        features: [
          { key: 'pages', label: 'Páginas', value: 'Até 12', included: true },
          { key: 'support', label: 'Suporte', value: 'Prioritário', included: true },
          { key: 'seo', label: 'SEO técnico', value: 'Avançado', included: true },
          { key: 'integrations', label: 'Integrações', value: 'Até 3', included: true },
          { key: 'automation', label: 'Automação', value: 'Fluxos básicos', included: true },
          { key: 'ai', label: 'IA', value: '—', included: false },
          { key: 'analytics', label: 'Analytics', value: 'Completo', included: true },
          { key: 'maintenance', label: 'Manutenção', value: 'Incluída', included: true },
          { key: 'custom', label: 'Desenvolvimento personalizado', value: 'Sim', included: true },
        ],
      },
      {
        slug: 'scale',
        name: 'SCALE',
        tagline: 'Sistemas e integrações.',
        description: 'Sistemas internos, integrações e automações de maior escopo.',
        price_label: 'Sob consulta',
        price_value: null,
        is_active: true,
        is_featured: false,
        sort_order: 3,
        features: [
          { key: 'pages', label: 'Páginas', value: 'Ilimitadas*', included: true },
          { key: 'support', label: 'Suporte', value: 'Dedicado', included: true },
          { key: 'seo', label: 'SEO técnico', value: 'Avançado', included: true },
          { key: 'integrations', label: 'Integrações', value: 'Múltiplas', included: true },
          { key: 'automation', label: 'Automação', value: 'Avançada', included: true },
          { key: 'ai', label: 'IA', value: 'Opcional', included: true },
          { key: 'analytics', label: 'Analytics', value: 'Completo', included: true },
          { key: 'maintenance', label: 'Manutenção', value: 'Incluída', included: true },
          { key: 'custom', label: 'Desenvolvimento personalizado', value: 'Sim', included: true },
        ],
      },
      {
        slug: 'custom',
        name: 'CUSTOM',
        tagline: 'Projetos sob medida.',
        description: 'Arquitetura e desenvolvimento completamente personalizados.',
        price_label: 'Sob consulta',
        price_value: null,
        is_active: true,
        is_featured: false,
        sort_order: 4,
        features: [
          { key: 'pages', label: 'Páginas', value: 'Sob medida', included: true },
          { key: 'support', label: 'Suporte', value: 'Dedicado', included: true },
          { key: 'seo', label: 'SEO técnico', value: 'Completo', included: true },
          { key: 'integrations', label: 'Integrações', value: 'Ilimitadas*', included: true },
          { key: 'automation', label: 'Automação', value: 'Completa', included: true },
          { key: 'ai', label: 'IA', value: 'Integrada', included: true },
          { key: 'analytics', label: 'Analytics', value: 'Custom', included: true },
          { key: 'maintenance', label: 'Manutenção', value: 'Incluída', included: true },
          { key: 'custom', label: 'Desenvolvimento personalizado', value: 'Total', included: true },
        ],
      },
    ];

    for (const plan of plans) {
      const { rows } = await client.query('SELECT id FROM plans WHERE slug = $1', [plan.slug]);
      let planId;
      if (rows.length === 0) {
        const res = await client.query(
          `INSERT INTO plans (slug, name, tagline, description, price_label, price_value, is_active, is_featured, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
          [
            plan.slug, plan.name, plan.tagline, plan.description, plan.price_label,
            plan.price_value, plan.is_active, plan.is_featured, plan.sort_order,
          ]
        );
        planId = res.rows[0].id;
        console.log(`  Plan: ${plan.name}`);
      } else {
        planId = rows[0].id;
      }

      for (const f of plan.features) {
        const { rows: fr } = await client.query(
          'SELECT id FROM plan_features WHERE plan_id = $1 AND feature_key = $2',
          [planId, f.key]
        );
        if (fr.length === 0) {
          await client.query(
            `INSERT INTO plan_features (plan_id, feature_key, feature_label, feature_value, is_included, sort_order)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [planId, f.key, f.label, f.value, f.included, plan.features.indexOf(f)]
          );
        }
      }
    }

    // FAQs
    const faqs = [
      {
        question: 'Como funciona o processo de trabalho da AURELIA?',
        answer: 'Trabalhamos em etapas claras: entendimento do problema, definição de estratégia, arquitetura da solução, implementação, testes e entrega. Cada fase tem entregáveis definidos e alinhamento contínuo.',
        sort_order: 1,
      },
      {
        question: 'Vocês desenvolvem apenas sites ou também sistemas?',
        answer: 'Desenvolvemos sites, sistemas internos, automações, integrações e soluções com inteligência artificial. O escopo é definido a partir da necessidade real do cliente.',
        sort_order: 2,
      },
      {
        question: 'Os planos incluem manutenção?',
        answer: 'Depende do plano. ESSENTIAL tem manutenção opcional. GROWTH, SCALE e CUSTOM incluem suporte e manutenção conforme o acordo contratual.',
        sort_order: 3,
      },
      {
        question: 'É possível começar com um plano menor e evoluir depois?',
        answer: 'Sim. Muitos projetos começam com ESSENTIAL ou GROWTH e evoluem conforme a operação amadurece e novas necessidades aparecem.',
        sort_order: 4,
      },
      {
        question: 'Vocês trabalham com prazos definidos?',
        answer: 'Sim. Cada projeto tem cronograma acordado. Mudanças de escopo são tratadas de forma transparente e documentada.',
        sort_order: 5,
      },
      {
        question: 'Como é feita a comunicação durante o projeto?',
        answer: 'Canais definidos no início (reuniões periódicas, canal de mensagens e documentação). Transparência é parte do método.',
        sort_order: 6,
      },
    {
        question: 'Quais tecnologias vocês utilizam?',
        answer: 'Escolhemos a stack conforme o problema: web de alta performance, APIs Node.js, PostgreSQL, integrações e, quando faz sentido, camadas de inteligência artificial. A decisão é técnica e alinhada ao contexto do cliente.',
        sort_order: 7,
      },
      {
        question: 'Como funciona a confidencialidade dos projetos?',
        answer: 'Trabalhamos com acordos de confidencialidade quando necessário. Informações sensíveis do cliente não são divulgadas sem autorização. Cases públicos só entram no portfólio com anuência.',
        sort_order: 8,
      },
      {
        question: 'Vocês atendem empresas de qualquer porte?',
        answer: 'Atendemos empresas que precisam de engenharia séria — do time enxuto ao operação em escala. O plano e o escopo são definidos a partir da necessidade real, não de um pacote genérico.',
        sort_order: 9,
      },
    ];

    for (const faq of faqs) {
      const { rows } = await client.query(
        'SELECT id FROM faqs WHERE question = $1',
        [faq.question]
      );
      if (rows.length === 0) {
        await client.query(
          `INSERT INTO faqs (question, answer, is_active, sort_order) VALUES ($1,$2,true,$3)`,
          [faq.question, faq.answer, faq.sort_order]
        );
      }
    }
    console.log('  FAQs seeded');

    // Site settings
    const settings = {
      site_name: 'AURELIA',
      tagline: 'Tecnologia que transforma complexidade em vantagem.',
      contact_email: 'contato@aurelia.com.br',
      contact_phone: '',
      social_linkedin: '',
      social_instagram: '',
      seo_default_title: 'AURELIA — Tecnologia que transforma complexidade em vantagem',
      seo_default_description:
        'A AURELIA desenvolve automações, sistemas e experiências digitais sob medida para transformar processos complexos em operações mais inteligentes e escaláveis.',
      cta_primary: 'Falar com a AURELIA',
      cta_secondary: 'Explorar projetos',
    };

    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
    }
    console.log('  Settings seeded');

    console.log('Seed complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
