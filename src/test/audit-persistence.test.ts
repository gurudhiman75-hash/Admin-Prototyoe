import { beforeEach, describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  createAuditEntry,
  createDefaultState,
  dedupeAuditEntries,
  loadState,
  saveState,
} from '@/app/store/persistence';

describe('audit persistence normalization', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('deduplicates audit entries by ID while preserving first occurrence order', () => {
    const first = createAuditEntry('Admin', 'Super Admin', 'FIRST', 'test', 'T-1', 'Test 1', '', '', 'first');
    const second = createAuditEntry('Admin', 'Super Admin', 'SECOND', 'test', 'T-2', 'Test 2', '', '', 'second');

    const result = dedupeAuditEntries([first, second, first]);

    expect(result).toHaveLength(2);
    expect(result.map((entry) => entry.id)).toEqual([first.id, second.id]);
  });

  it('persists a normalized state without duplicate audit IDs', () => {
    const state = createDefaultState();
    const entry = createAuditEntry('Admin', 'Super Admin', 'UPDATE', 'test', 'T-1', 'Test 1', 'Draft', 'Live', 'publish');
    state.auditLogs = [entry, entry, ...state.auditLogs];

    saveState(state);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as typeof state;
    expect(stored.auditLogs.filter((item) => item.id === entry.id)).toHaveLength(1);
  });

  it('normalizes duplicate audit IDs when loading existing prototype state', () => {
    const state = createDefaultState();
    const entry = createAuditEntry('Admin', 'Super Admin', 'UPDATE', 'question', 'Q-1', 'Question 1', 'Draft', 'Approved', 'review');
    state.auditLogs = [entry, entry, ...state.auditLogs];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const loaded = loadState();

    expect(loaded.auditLogs.filter((item) => item.id === entry.id)).toHaveLength(1);
  });
});
