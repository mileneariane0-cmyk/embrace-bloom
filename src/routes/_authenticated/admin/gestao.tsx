import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, CalendarHeart, Link2, ShoppingBag, Users, Search, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getManagement, updateInvitationLink } from '@/lib/management.functions';
import { invitationAvailability, productionLabels } from '@/lib/management';

export const Route = createFileRoute('/_authenticated/admin/gestao')({
  head: () => ({ meta: [
    { title: 'Gestão | Administração Personalizê' },
    { name: 'description', content: 'Gestão administrativa de convites, links exclusivos, pedidos e clientes da Personalizê.' },
    { property: 'og:title', content: 'Gestão administrativa — Personalizê' },
    { property: 'og:description', content: 'Convites, links exclusivos, produção e clientes da Personalizê.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' },
  ] }),
  component: Gestao,
});

const modules = [
  { key: 'models', title: 'Convites', icon: CalendarHeart },
  { key: 'invitations', title: 'Links dos Convites', icon: Link2 },
  { key: 'orders', title: 'Pedidos', icon: ShoppingBag },
  { key: 'customers', title: 'Clientes', icon: Users },
] as const;
type LinkRow = Awaited<ReturnType<typeof getManagement>>['invitations'][number];

function Gestao() {
  const fetchManagement = useServerFn(getManagement);
  const { data, isPending, error, refetch, isFetching } = useQuery({ queryKey: ['management'], queryFn: () => fetchManagement() });
  const [search, setSearch] = useState('');
  const matches = (...values: (string | null)[]) => values.join(' ').toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'));
  const customerName = (id: string | null) => data?.customers.find(customer => customer.id === id)?.full_name ?? 'Não informado';
  return <main className="management-theme min-h-screen bg-background px-4 py-8 text-foreground sm:px-8">
    <div className="mx-auto max-w-6xl">
      <Button asChild variant="link" className="px-0"><Link to="/admin"><ArrowLeft />Voltar ao painel</Link></Button>
      <header className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div><p className="mb-2 text-sm text-muted-foreground">Administração · Personalizê</p><h1 className="font-serif text-4xl text-primary">Gestão</h1></div>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck size={18} />Acesso da administradora</span>
      </header>
      {isPending ? <p className="py-12" role="status">Carregando registros...</p> : error ? <div className="py-12"><p role="alert">{error.message}</p><Button className="mt-4" onClick={() => refetch()}><RefreshCw />Tentar novamente</Button></div> : data && <Tabs defaultValue="models" onValueChange={() => setSearch('')} className="mt-6">
        <TabsList aria-label="Módulos de gestão" className="grid h-auto w-full grid-cols-2 gap-1 rounded-md p-1 sm:grid-cols-4">
          {modules.map(module => <TabsTrigger key={module.key} value={module.key} className="min-h-12 gap-2 whitespace-normal px-2 data-[state=active]:text-primary"><module.icon size={18} /><span>{module.title}</span><span className="text-xs text-muted-foreground">{data[module.key].length}</span></TabsTrigger>)}
        </TabsList>
        <div className="my-6 flex gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-muted-foreground" size={16} /><Input aria-label="Buscar registros" placeholder="Buscar registros" className="h-10 bg-card pl-9" value={search} onChange={event => setSearch(event.target.value)} /></div><Button variant="outline" size="icon" className="h-10 w-10" title="Atualizar registros" aria-label="Atualizar registros" disabled={isFetching} onClick={() => refetch()}><RefreshCw /></Button></div>
        <TabsContent value="models"><h2 className="mb-5 font-serif text-2xl text-primary">Modelos de convites</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.models.filter(row => matches(row.title, row.category)).map(row => <article key={row.id} className="rounded-md border border-border bg-card p-5"><CalendarHeart className="mb-4 text-primary" /><h3 className="break-words font-medium">{row.title}</h3><p className="mt-2 text-sm text-muted-foreground">{row.category || 'Sem categoria'}</p><p className="mt-4 text-sm text-primary">{{ draft: 'Rascunho', available: 'Disponível', archived: 'Arquivado' }[row.status] ?? row.status}</p></article>)}</div>{!data.models.some(row => matches(row.title, row.category)) && <Empty icon={CalendarHeart} text={search ? 'Nenhum modelo encontrado.' : 'Nenhum modelo cadastrado.'} />}</TabsContent>
        <TabsContent value="invitations"><h2 className="mb-5 font-serif text-2xl text-primary">Links dos Convites</h2><div className="space-y-4">{data.invitations.filter(row => matches(row.title, row.slug, customerName(row.customer_id))).map(row => <LinkEditor key={`${row.id}-${row.status}-${row.expires_at}`} row={row} customer={customerName(row.customer_id)} />)}</div>{!data.invitations.some(row => matches(row.title, row.slug, customerName(row.customer_id))) && <Empty icon={Link2} text={search ? 'Nenhum convite encontrado.' : 'Nenhum convite individual registrado.'} />}</TabsContent>
        <TabsContent value="orders"><h2 className="mb-5 font-serif text-2xl text-primary">Andamento dos pedidos</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-muted-foreground"><tr>{['Pedido', 'Cliente', 'Convite', 'Produção', 'Data'].map(label => <th key={label} className="whitespace-nowrap p-3 font-medium">{label}</th>)}</tr></thead><tbody>{data.orders.filter(row => matches(row.id, customerName(row.customer_id), productionLabels[row.production_status] ?? '')).map(row => <tr key={row.id} className="border-b border-border"><td className="p-3">#{row.id.slice(0, 8)}</td><td className="p-3">{customerName(row.customer_id)}</td><td className="p-3">{data.models.find(model => model.id === row.model_id)?.title ?? 'Não informado'}</td><td className="whitespace-nowrap p-3 text-primary">{productionLabels[row.production_status] ?? row.production_status}</td><td className="whitespace-nowrap p-3">{new Date(row.created_at).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></div>{!data.orders.some(row => matches(row.id, customerName(row.customer_id), productionLabels[row.production_status] ?? '')) && <Empty icon={ShoppingBag} text={search ? 'Nenhum pedido encontrado.' : 'Nenhum pedido registrado.'} />}</TabsContent>
        <TabsContent value="customers"><h2 className="mb-5 font-serif text-2xl text-primary">Clientes cadastrados</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.customers.filter(row => matches(row.full_name, row.email, row.phone)).map(row => <article key={row.id} className="rounded-md border border-border bg-card p-5"><h3 className="break-words font-medium">{row.full_name}</h3><p className="mt-3 break-all text-sm text-muted-foreground">{row.email || 'E-mail não informado'}</p><p className="mt-2 text-sm text-muted-foreground">{row.phone || 'Telefone não informado'}</p></article>)}</div>{!data.customers.some(row => matches(row.full_name, row.email, row.phone)) && <Empty icon={Users} text={search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'} />}</TabsContent>
      </Tabs>}
    </div>
  </main>;
}
function Empty({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-muted-foreground"><Icon size={36} strokeWidth={1.3} /><p className="text-center">{text}</p></div>;
}
function LinkEditor({ row, customer }: { row: LinkRow; customer: string }) {
  const save = useServerFn(updateInvitationLink);
  const qc = useQueryClient();
  const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>(row.status === 'active' ? 'active' : row.status === 'archived' ? 'archived' : 'inactive');
  const [expiry, setExpiry] = useState(row.expires_at ? localDate(row.expires_at) : '');
  const mutation = useMutation({ mutationFn: () => save({ data: { id: row.id, status, expires_at: expiry ? new Date(expiry).toISOString() : null } }), onSuccess: () => qc.invalidateQueries({ queryKey: ['management'] }) });
  return <form className="rounded-md border border-border bg-card p-5" onSubmit={event => { event.preventDefault(); mutation.mutate(); }}>
    <div className="flex flex-wrap justify-between gap-2"><h3 className="break-words font-medium">{row.title}</h3><span className="text-sm text-primary">{invitationAvailability(row)}</span></div>
    <p className="mt-2 text-sm text-muted-foreground">{customer}</p><p className="mt-3 break-all font-mono text-xs text-muted-foreground">Identificador exclusivo: {row.slug}</p>
    <div className="mt-5 grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
      <label className="text-sm">Status<select aria-label={`Status de ${row.title}`} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" value={status} onChange={event => { const value = event.target.value; if (value === 'active' || value === 'inactive' || value === 'archived') setStatus(value); }}><option value="inactive">Inativo</option><option value="active" disabled={!row.published_at}>Ativo</option><option value="archived">Arquivado</option></select></label>
      <label className="text-sm">Expiração (opcional)<Input aria-label={`Expiração de ${row.title}`} className="mt-2 h-10" type="datetime-local" value={expiry} onChange={event => setExpiry(event.target.value)} /></label>
      <Button disabled={mutation.isPending} className="h-10"><Save />Salvar</Button>
    </div>
    {mutation.error && <p role="alert" className="mt-3 text-sm text-destructive">{mutation.error.message}</p>}
  </form>;
}
function localDate(value: string) { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
