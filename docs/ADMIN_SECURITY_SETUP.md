# Personalizê — Implantação segura do painel administrativo

## Estado atual

- A homepage e o link discreto de Administração estão implementados.
- A rota `/admin/login` é uma tela informativa **sem autenticação ativa**.
- A migração `supabase/migrations/20261023_001_initial.sql` foi versionada, mas não foi executada em nenhum banco.
- Nenhum dashboard ou operação de escrita administrativa deve ser exposto sem validação no servidor.

## Primeira instalação — contrato de segurança

1. Conectar um projeto Supabase exclusivo da Personalizê e definir as variáveis de ambiente no serviço de hospedagem; nunca versionar chaves secretas.
2. Executar as migrações em ambiente controlado, verificar RLS e permissões.
3. Criar um segredo de instalação criptograficamente aleatório no ambiente do servidor (não no bundle do cliente).
4. Implementar um endpoint de instalação com limitação de tentativas, verificação do segredo no servidor e uma operação atômica de inicialização. O endpoint deve rejeitar instalações subsequentes de maneira permanente, inclusive sob requisições simultâneas.
5. Criar o usuário via Supabase Auth Admin API **somente no servidor**, associar a função `owner` e registrar a conclusão em transação/controle único. Não permitir autoprovisionamento de privilégios.
6. Invalidar o segredo de instalação, bloquear o endpoint de setup e verificar que tentativas repetidas falham.
7. Implementar login com cookies de sessão seguros, recuperação de senha, logout e validação de permissão em **cada operação administrativa no servidor**.

> Não é seguro abrir cadastro público de administrador com base apenas em contagem zero de usuários.

## Painel

O dashboard deve consultar dados reais com autorização no backend. Na ausência de banco conectado, mostrar uma mensagem de configuração, nunca métricas inventadas.

Seções planejadas: visão geral, editor do site, convites, editor de convites, modelos, categorias, pedidos, clientes, pagamentos, configurações e auditoria.

## Editor do site

Manter rascunhos e publicações separados, validar JSON de componentes, registrar versões e permitir rollback. Nunca renderizar HTML arbitrário fornecido pelo administrador sem sanitização.

## Critérios de aceite

- Visitantes não conseguem acessar endpoints administrativos.
- Sem segredo de instalação válido, o primeiro administrador não pode ser criado.
- Setup só é concluído uma vez, mesmo sob concorrência.
- Login, logout e recuperação funcionam após configurar o provedor.
- O usuário comum não pode atribuir a si próprio uma função administrativa.
- A homepage pública continua funcionando quando o banco estiver indisponível.
- Pagamentos só mudam para confirmados após webhook verificado no servidor.

## Dependências de implantação

É necessário conectar/configurar Supabase e a hospedagem com segredos de servidor antes de habilitar login, dashboard, persistência e criação inicial. Não incluir segredos reais neste repositório.
