import { AuditEvent } from '../models/AuditEvent.js';

/** Persist privacy-conscious admin activity without delaying the request response. */
export function recordAuditEvent(action: string, adminId?: string, metadata: Record<string, unknown> = {}): void {
  void AuditEvent.create({ action, adminId: adminId ?? null, metadata, occurredAt: new Date() }).catch(() => {
    // Do not log request data or silently turn an audit-store outage into a request failure.
    console.error('Could not persist administrative audit event.');
  });
}
