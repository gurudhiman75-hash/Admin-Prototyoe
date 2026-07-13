import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  PrototypeStoreProvider,
  usePrototypeStore,
} from '@/app/store/PrototypeStore';
import { createDefaultState, STORAGE_KEY } from '@/app/store/persistence';
import type { PrototypeState } from '@/app/store/types';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

/** Render the provider and expose the live store value via renderHook. */
function renderStore() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <PrototypeStoreProvider>{children}</PrototypeStoreProvider>
  );
  return renderHook(() => usePrototypeStore(), { wrapper });
}

describe('PrototypeStore — initialization', () => {
  it('seeds default mock data (48 questions, 32 tests, 60 students)', () => {
    const { result } = renderStore();
    expect(result.current.state.questions).toHaveLength(48);
    expect(result.current.state.tests).toHaveLength(32);
    expect(result.current.state.students).toHaveLength(60);
  });

  it('starts in the Super Admin role', () => {
    const { result } = renderStore();
    expect(result.current.activeRole).toBe('Super Admin');
  });
});

describe('PrototypeStore — UPDATE_QUESTION', () => {
  it('updates a question status to Approved', () => {
    const { result } = renderStore();
    const first = result.current.state.questions[0]!;
    const originalStatus = first.status;

    const updated = { ...first, status: 'Approved' };
    act(() => {
      result.current.dispatch({ type: 'UPDATE_QUESTION', question: updated });
    });

    const inState = result.current.state.questions.find((q) => q.id === first.id);
    expect(inState?.status).toBe('Approved');
    expect(inState?.status).not.toBe(originalStatus);
  });
});

describe('PrototypeStore — audit()', () => {
  it('appends a new audit log entry to state', () => {
    const { result } = renderStore();
    const before = result.current.state.auditLogs.length;

    let entryId = '';
    act(() => {
      const entry = result.current.audit(
        'TEST_ACTION',
        'question',
        'Q-1000',
        'Q-1000',
        'old',
        'new',
        'test reason',
      );
      entryId = entry.id;
    });

    expect(result.current.state.auditLogs.length).toBe(before + 1);
    const added = result.current.state.auditLogs[0];
    expect(added).toBeDefined();
    expect(added!.id).toBe(entryId);
    expect(added!.action).toBe('TEST_ACTION');
    expect(added!.entityId).toBe('Q-1000');
    expect(added!.reason).toBe('test reason');
  });
});

describe('PrototypeStore — RESET', () => {
  it('restores default state after a mutation', () => {
    const { result } = renderStore();
    const first = result.current.state.questions[0]!;

    // Mutate first so reset is observable.
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_QUESTION',
        question: { ...first, status: 'Approved' },
      });
    });
    expect(
      result.current.state.questions.find((q) => q.id === first.id)?.status,
    ).toBe('Approved');

    act(() => {
      result.current.dispatch({ type: 'RESET' });
    });

    expect(result.current.state.questions).toHaveLength(48);
    // The default question is restored (status no longer Approved).
    const restored = result.current.state.questions.find((q) => q.id === first.id);
    expect(restored?.status).not.toBe('Approved');
  });
});

describe('PrototypeStore — setRole() + hasPermission()', () => {
  it('switches to Reviewer with the expected permission set', () => {
    const { result } = renderStore();

    act(() => {
      result.current.setRole('Reviewer');
    });

    expect(result.current.activeRole).toBe('Reviewer');
    expect(result.current.hasPermission('review.approve')).toBe(true);
    expect(result.current.hasPermission('questions.archive')).toBe(false);
  });
});

describe('PrototypeStore — localStorage persistence', () => {
  it('persists dispatched updates under the storage key', async () => {
    const { result } = renderStore();
    const first = result.current.state.questions[0]!;

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_QUESTION',
        question: { ...first, status: 'Approved' },
      });
    });

    // The persistence effect runs after render; wait for it to flush.
    await waitFor(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
    });

    const raw = localStorage.getItem(STORAGE_KEY)!;
    const parsed = JSON.parse(raw) as PrototypeState;
    const persisted = parsed.questions.find((q) => q.id === first.id);
    expect(persisted?.status).toBe('Approved');
  });

  it('rehydrates state from localStorage on a fresh provider mount', async () => {
    // First mount: mutate and let it persist.
    const first = renderStore();
    const q = first.result.current.state.questions[0]!;
    act(() => {
      first.result.current.dispatch({
        type: 'UPDATE_QUESTION',
        question: { ...q, status: 'Approved' },
      });
    });
    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });
    first.unmount();

    // Second mount simulates a page refresh: loadState reads localStorage.
    const second = renderStore();
    const rehydrated = second.result.current.state.questions.find(
      (x) => x.id === q.id,
    );
    expect(rehydrated?.status).toBe('Approved');
  });

  it('falls back to defaults when localStorage is empty', () => {
    localStorage.clear();
    const { result } = renderStore();
    const defaults = createDefaultState();
    expect(result.current.state.questions).toHaveLength(defaults.questions.length);
    expect(result.current.state.activeRole).toBe(defaults.activeRole);
  });
});
