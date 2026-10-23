export function invitationAvailability(invitation: { status: string; published_at: string | null; expires_at: string | null }, now = Date.now()) {
  if (invitation.status === 'archived') return 'Arquivado';
  if (invitation.status !== 'active' || !invitation.published_at) return 'Inativo';
  if (invitation.expires_at && Date.parse(invitation.expires_at) <= now) return 'Expirado';
  return 'Ativo';
}

export const productionLabels: Record<string, string> = {
  awaiting_information: 'Aguardando informações', queued: 'Na fila', personalizing: 'Em personalização',
  review: 'Em revisão', published: 'Publicado', delivered: 'Entregue', cancelled: 'Cancelado',
};