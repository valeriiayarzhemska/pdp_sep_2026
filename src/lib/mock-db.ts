import type {
  Attachment,
  DemoRecord,
  PresignTicket,
  StoredObject,
} from './types';

// Next.js dev mode reloads server modules on every edit, which would wipe a
// plain module-level Map. Stashing the store on `globalThis` keeps the mock
// "backend" state alive across hot reloads, the same way a real backend's
// in-memory cache would survive a code change but not a process restart.
type MockDb = {
  presignTickets: Map<string, PresignTicket>;
  objects: Map<string, StoredObject>;
  attachments: Map<string, Attachment>;
  records: Map<string, DemoRecord>;
};

const globalForDb = globalThis as unknown as { __mockDb?: MockDb };

function createDb(): MockDb {
  const records = new Map<string, DemoRecord>();
  records.set('record-1', { id: 'record-1', title: 'Record 1' });
  records.set('record-2', {
    id: 'record-2',
    title: 'Record 2',
  });

  return {
    presignTickets: new Map(),
    objects: new Map(),
    attachments: new Map(),
    records,
  };
}

export const mockDb =
  globalForDb.__mockDb ?? (globalForDb.__mockDb = createDb());
