import { describe, expect, it } from 'vitest';
import { invitationAvailability } from '@/lib/management';

describe('Exclusive invitation availability', () => {
  const published = { status: 'active', published_at: '2026-10-23T12:00:00Z', expires_at: null };
  it('keeps inactive invitations unavailable even when published', () => {
    expect(invitationAvailability({ ...published, status: 'inactive' })).toBe('Inativo');
  });
  it('makes expired links unavailable at the expiration instant', () => {
    expect(invitationAvailability({ ...published, expires_at: '2026-10-24T12:00:00Z' }, Date.parse('2026-10-24T12:00:00Z'))).toBe('Expirado');
  });
  it('requires publication before marking a link active', () => {
    expect(invitationAvailability({ ...published, published_at: null })).toBe('Inativo');
  });
  it('permits an active published invitation without expiration', () => {
    expect(invitationAvailability(published)).toBe('Ativo');
  });
});