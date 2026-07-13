import { describe, it, expect } from 'vitest';
import { validateDraft, canPublish } from '@/app/store/validation';
import type { TestDraft } from '@/app/store/types';

/** A fully valid draft — each test mutates a copy to introduce the flaw. */
function validDraft(): TestDraft {
  return {
    basicInfo: {
      name: 'SSC CGL Mock Test 1',
      examCode: 'SSC_CGL_T1',
      testType: 'Full Mock',
      language: 'English',
      access: 'Paid',
      difficulty: 'Moderate',
      description: 'A full-length mock test.',
    },
    pattern: {
      totalQuestions: 2,
      totalMarks: 4,
      durationMinutes: 60,
      marksPerQuestion: 2,
      negativeMarks: 0,
      sectionTiming: 'shared',
      navigationRules: {
        switchSections: true,
        markForReview: true,
        preventFullscreenExit: true,
      },
    },
    sections: [
      { id: 's1', name: 'Quant', subject: 'Quantitative Aptitude', questions: 1, marks: 2, duration: 30 },
      { id: 's2', name: 'Reasoning', subject: 'Reasoning', questions: 1, marks: 2, duration: 30 },
    ],
    selectedQuestionIds: ['Q-1000', 'Q-1001'],
    schedule: { mode: 'publish-now' },
  };
}

const ids = (issues: ReturnType<typeof validateDraft>) => issues.map((i) => i.id);
const errs = (issues: ReturnType<typeof validateDraft>) =>
  issues.filter((i) => i.severity === 'error');
const warns = (issues: ReturnType<typeof validateDraft>) =>
  issues.filter((i) => i.severity === 'warning');

describe('validateDraft', () => {
  it('flags an empty draft with missing name, exam, and sections', () => {
    const draft: TestDraft = {
      ...validDraft(),
      basicInfo: { ...validDraft().basicInfo, name: '', examCode: '' },
      sections: [],
      selectedQuestionIds: [],
    };
    const issues = validateDraft(draft);
    expect(ids(issues)).toContain('name-empty');
    expect(ids(issues)).toContain('exam-empty');
    expect(ids(issues)).toContain('no-sections');
    expect(errs(issues).length).toBeGreaterThan(0);
  });

  it('errors when totalQuestions is zero', () => {
    const draft = validDraft();
    draft.pattern.totalQuestions = 0;
    const issues = validateDraft(draft);
    expect(ids(issues)).toContain('total-questions');
    expect(errs(issues).some((e) => e.id === 'total-questions')).toBe(true);
  });

  it('warns when section question counts sum to the wrong total', () => {
    const draft = validDraft();
    // Sections sum to 1+1=2 but bump the pattern total out of sync.
    draft.pattern.totalQuestions = 5;
    const issues = validateDraft(draft);
    expect(ids(issues)).toContain('section-q-sum');
    expect(warns(issues).some((w) => w.id === 'section-q-sum')).toBe(true);
  });

  it('warns on duplicate section names', () => {
    const draft = validDraft();
    draft.sections = [
      { id: 's1', name: 'Quant', subject: 'Quant', questions: 1, marks: 2, duration: 30 },
      { id: 's2', name: 'Quant', subject: 'Quant', questions: 1, marks: 2, duration: 30 },
    ];
    const issues = validateDraft(draft);
    expect(ids(issues)).toContain('section-dup-Quant');
    expect(warns(issues).some((w) => w.id === 'section-dup-Quant')).toBe(true);
  });

  it('errors when scheduled mode has no publishAt', () => {
    const draft = validDraft();
    draft.schedule = { mode: 'scheduled' }; // no publishAt
    const issues = validateDraft(draft);
    expect(ids(issues)).toContain('schedule-no-date');
    expect(errs(issues).some((e) => e.id === 'schedule-no-date')).toBe(true);
  });

  it('errors when QA mode has no reviewerId', () => {
    const draft = validDraft();
    draft.schedule = { mode: 'qa' }; // no reviewerId
    const issues = validateDraft(draft);
    expect(ids(issues)).toContain('qa-no-reviewer');
    expect(errs(issues).some((e) => e.id === 'qa-no-reviewer')).toBe(true);
  });

  it('produces no errors and no warnings for a valid draft', () => {
    const issues = validateDraft(validDraft());
    expect(errs(issues)).toHaveLength(0);
    expect(warns(issues)).toHaveLength(0);
  });
});

describe('canPublish', () => {
  it('returns true for a valid draft', () => {
    expect(canPublish(validDraft())).toBe(true);
  });

  it('returns false when errors exist (publishing blocked)', () => {
    const draft = validDraft();
    draft.basicInfo.name = ''; // produces an error
    expect(canPublish(draft)).toBe(false);
  });

  it('returns true when only warnings exist (publishing allowed)', () => {
    const draft = validDraft();
    // Mismatch section sum -> warning only.
    draft.pattern.totalQuestions = 5;
    expect(canPublish(draft)).toBe(true);
  });
});
