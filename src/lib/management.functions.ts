import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getManagement = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'owner' });
    if (role.error || !role.data) throw new Error('Acesso restrito à administradora.');
    const [models, invitations, orders, customers] = await Promise.all([
      context.supabase.from('invitation_models').select('id,title,category,status,created_at').order('created_at', { ascending: false }),
      context.supabase.from('customer_invitations').select('id,title,slug,status,expires_at,published_at,customer_id').order('created_at', { ascending: false }),
      context.supabase.from('customer_orders').select('id,customer_id,model_id,production_status,created_at').order('created_at', { ascending: false }),
      context.supabase.from('customer_profiles').select('id,full_name,email,phone,created_at').order('created_at', { ascending: false }),
    ]);
    if ([models, invitations, orders, customers].some(result => result.error)) throw new Error('Não foi possível carregar os registros. Tente novamente.');
    return { models: models.data ?? [], invitations: invitations.data ?? [], orders: orders.data ?? [], customers: customers.data ?? [] };
  });

export const updateInvitationLink = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: z.enum(['active', 'inactive', 'archived']), expires_at: z.string().datetime().nullable() }))
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'owner' });
    if (role.error || !role.data) throw new Error('Acesso restrito à administradora.');
    const { data: invitation, error } = await context.supabase.from('customer_invitations').update({ status: data.status, expires_at: data.expires_at }).eq('id', data.id).select('id').single();
    if (error || !invitation) throw new Error('Não foi possível salvar. A ativação exige um convite publicado.');
    return { ok: true };
  });