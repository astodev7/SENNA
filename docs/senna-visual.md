# SENNA — identidade visual nas páginas internas

Todas as páginas públicas, o detalhe do projeto, as páginas legais, a página 404, o login e o painel administrativo seguem a direção visual da home: fundo escuro, tons marfim e cromo, Hanken Grotesk, títulos sem serifa em caixa alta e divisórias discretas.

## Implementação

- `frontend/css/senna-pages.css`: sistema das páginas internas, responsividade, formulários, cards, etapas, FAQ e rodapé.
- `frontend/css/senna-admin.css`: linguagem visual adaptada ao painel e ao login.
- As páginas públicas compartilham os tokens e a navegação de `senna-home.css`.
- Identidade exibida: SENNA. O namespace interno `AURELIA.api` foi preservado para compatibilidade.
- Navegação mobile com Escape, fechamento ao selecionar um link e reset no redimensionamento.
- Portfólio com capas opcionais dos projetos e filtros preservados.
- Formulário de contato usa validação nativa antes de enviar à API existente.
- O backend e os contratos da API não foram alterados.

## Validação

19 telas inspecionadas em 1440px e 390px. Verificação de rolagem horizontal, execução dos scripts, navegação mobile, seleção de soluções, filtros, expansão do FAQ e envio do contato. Os testes das telas com dados e do envio usaram respostas de API simuladas, sem depender de banco de dados ou credenciais.

A imagem e a integração visual da home permaneceram intactas nesta atualização.
