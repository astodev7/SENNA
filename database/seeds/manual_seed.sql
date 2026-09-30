-- Seed manual (rode no SQL Editor do Supabase se npm run seed falhar)

-- Projetos principais
INSERT INTO projects (
  slug, title, category, summary, description, problem, context, solution,
  architecture, technologies, results, external_url, is_published, is_featured, sort_order,
  meta_title, meta_description
) VALUES
(
  'vortex', 'VORTEX', 'Web',
  'Plataforma imobiliária de alto padrão com curadoria de imóveis e jornada de contato.',
  'A Vortex Imóveis apresenta residências exclusivas em São Paulo e região, com vitrine clara, filtros por tipologia e captura de leads qualificados.',
  'Imobiliárias de alto padrão precisam de presença digital que transmita exclusividade, organize o inventário e converta interessados sem fricção.',
  'Mercado imobiliário de luxo em São Paulo — apartamentos, casas, coberturas e terrenos em bairros estratégicos.',
  'Site institucional e de catálogo com busca por tipo de imóvel, cards de lançamento e destaque, narrativa de curadoria e formulário de contato integrado.',
  'Frontend de alta performance com listagem de imóveis, filtros e páginas de detalhe; camada de contato preparada para leads comerciais.',
  ARRAY['HTML','CSS','JavaScript','Vercel'],
  'Vitrine digital alinhada ao posicionamento de alto padrão, com navegação objetiva e canal direto de contato.',
  'https://vortex-beige-iota.vercel.app/',
  true, true, 0,
  'VORTEX — Imóveis de alto padrão | Projeto AURELIA',
  'Plataforma digital da Vortex Imóveis: curadoria de imóveis de alto padrão em São Paulo.'
),
(
  'rota', 'ROTA 16:15', 'E-commerce',
  'E-commerce de streetwear com identidade de marca, catálogo e lista VIP para drops limitados.',
  'A Rota 16:15 é moda urbana com propósito. O site estrutura manifesto, coleção, drops limitados e captura de lista VIP para o Drop 01.',
  'Marcas de streetwear precisam de vitrine com identidade forte, catálogo navegável e mecânica de lançamento (lista VIP / drops).',
  'Marca de moda urbana com posicionamento autoral e coleções em edições limitadas.',
  'Experiência e-commerce com hero de marca, filtros de catálogo, seções de drop e manifesto, e fluxo de inscrição na lista VIP.',
  'Storefront orientado a conversão e narrativa; catálogo por categorias; preparação para drops e lista de espera.',
  ARRAY['HTML','CSS','JavaScript','Vercel'],
  'Presença digital coerente com a identidade da marca e prontidão para lançamentos e captura de audiência.',
  'https://rota-16-15-v3.vercel.app/',
  true, true, 0,
  'ROTA 16:15 — Streetwear | Projeto AURELIA',
  'E-commerce e experiência digital da Rota 16:15 — moda urbana com propósito.'
)
ON CONFLICT (slug) DO NOTHING;

-- Planos básicos
INSERT INTO plans (slug, name, tagline, description, price_label, is_active, is_featured, sort_order)
VALUES
  ('essential', 'ESSENTIAL', 'Presença digital profissional.', 'Site institucional claro, rápido e preparado para SEO.', 'Sob consulta', true, false, 1),
  ('growth', 'GROWTH', 'Presença + automação.', 'Site + automações leves e integrações essenciais.', 'Sob consulta', true, true, 2),
  ('scale', 'SCALE', 'Sistemas e integrações.', 'Sistemas internos, integrações e automações de maior escopo.', 'Sob consulta', true, false, 3),
  ('custom', 'CUSTOM', 'Projetos sob medida.', 'Arquitetura e desenvolvimento completamente personalizados.', 'Sob consulta', true, false, 4)
ON CONFLICT (slug) DO NOTHING;

-- FAQ
INSERT INTO faqs (question, answer, is_active, sort_order) VALUES
('Como funciona o processo de trabalho da AURELIA?', 'Trabalhamos em etapas claras: entendimento do problema, definição de estratégia, arquitetura da solução, implementação, testes e entrega.', true, 1),
('Vocês desenvolvem apenas sites ou também sistemas?', 'Desenvolvemos sites, sistemas internos, automações, integrações e soluções com inteligência artificial.', true, 2),
('Os planos incluem manutenção?', 'Depende do plano. ESSENTIAL tem manutenção opcional. GROWTH, SCALE e CUSTOM incluem suporte conforme o acordo.', true, 3),
('É possível começar com um plano menor e evoluir depois?', 'Sim. Muitos projetos começam com ESSENTIAL ou GROWTH e evoluem conforme a operação amadurece.', true, 4)
ON CONFLICT DO NOTHING;
