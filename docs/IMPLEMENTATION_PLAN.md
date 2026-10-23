# Personalizê — Plano de implementação

Slogan: **Cada detalhe é único.**

## Identidade visual

- Bordô: `#75152F`
- Rosa: `#F29BAA`
- Verde sálvia: `#819B87`
- Creme: `#FFF8F6`
- Branco: `#FFFFFF`
- Texto: `#30272B`

## Arquitetura existente

Preservar o projeto React + TypeScript + TanStack Start já presente no repositório. Integrar autenticação, persistência e permissões no backend antes de disponibilizar operações administrativas reais.

## Fases

1. Homepage responsiva, identidade visual, login administrativo seguro, dashboard e categorias/modelos persistentes.
2. Editor visual de convites, versões, prévias, publicação e links individuais.
3. Catálogo, checkout, webhooks de pagamento e pedidos.
4. Editor visual do site, banners, páginas institucionais e histórico de versões.
5. Área do cliente, relatórios e expansão de produtos.

## Regras de qualidade

Não simular pagamento confirmado nem autenticação administrativa. Não expor dados de clientes ou convidados. Garantir validação de entradas, RLS, controle de acesso no servidor e testes dos fluxos críticos.
