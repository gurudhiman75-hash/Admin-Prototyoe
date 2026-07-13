import type { TestDraft } from './types';

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  affectedEntity: string;
  suggestedAction: string;
}

/**
 * Validate a Test Builder draft and return a list of issues.
 *
 * Errors block publishing; warnings and infos surface friction but do not
 * block. Extracted from TestBuilderPage so it can be unit-tested in isolation.
 */
export function validateDraft(draft: TestDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Required basic info
  if (!draft.basicInfo.name.trim()) {
    issues.push({
      id: 'name-empty',
      severity: 'error',
      title: 'Test name is required',
      description: 'The test name cannot be empty.',
      affectedEntity: 'basicInfo.name',
      suggestedAction: 'Enter a test name in Basic Info.',
    });
  }
  if (!draft.basicInfo.examCode) {
    issues.push({
      id: 'exam-empty',
      severity: 'error',
      title: 'Exam is required',
      description: 'An exam must be selected for the test.',
      affectedEntity: 'basicInfo.examCode',
      suggestedAction: 'Select an exam in Basic Info.',
    });
  }

  // totalQuestions
  if (!(draft.pattern.totalQuestions > 0)) {
    issues.push({
      id: 'total-questions',
      severity: 'error',
      title: 'Total questions must be greater than zero',
      description: `Total questions is ${draft.pattern.totalQuestions}.`,
      affectedEntity: 'pattern.totalQuestions',
      suggestedAction: 'Set a positive number of questions in Pattern.',
    });
  }

  // durationMinutes
  if (!(draft.pattern.durationMinutes > 0)) {
    issues.push({
      id: 'duration',
      severity: 'error',
      title: 'Duration must be greater than zero',
      description: `Duration is ${draft.pattern.durationMinutes} minutes.`,
      affectedEntity: 'pattern.durationMinutes',
      suggestedAction: 'Set a positive duration in Pattern.',
    });
  }

  // At least 1 section
  if (draft.sections.length === 0) {
    issues.push({
      id: 'no-sections',
      severity: 'error',
      title: 'At least one section is required',
      description: 'No sections have been added to the test.',
      affectedEntity: 'sections',
      suggestedAction: 'Add a section in the Sections step.',
    });
  }

  // Empty section names + duplicate names
  const nonEmptyNames = draft.sections
    .map((s) => s.name.trim())
    .filter((n) => n.length > 0);
  draft.sections.forEach((s, idx) => {
    if (!s.name.trim()) {
      issues.push({
        id: `section-name-empty-${s.id}`,
        severity: 'error',
        title: `Section ${idx + 1} has an empty name`,
        description: 'Every section must have a name.',
        affectedEntity: `sections.${s.id}.name`,
        suggestedAction: 'Enter a name for this section.',
      });
    }
  });
  const dupNames = nonEmptyNames.filter((n, i, arr) => arr.indexOf(n) !== i);
  Array.from(new Set(dupNames)).forEach((name) => {
    issues.push({
      id: `section-dup-${name}`,
      severity: 'warning',
      title: `Duplicate section name: "${name}"`,
      description: 'Multiple sections share the same name.',
      affectedEntity: 'sections',
      suggestedAction: 'Rename duplicate sections to avoid confusion.',
    });
  });

  // Section question sum vs pattern total
  const sectionQSum = draft.sections.reduce((a, s) => a + (Number(s.questions) || 0), 0);
  if (draft.sections.length > 0 && sectionQSum !== draft.pattern.totalQuestions) {
    issues.push({
      id: 'section-q-sum',
      severity: 'warning',
      title: 'Section questions do not match the total',
      description: `Sections sum to ${sectionQSum} questions but the pattern total is ${draft.pattern.totalQuestions}.`,
      affectedEntity: 'sections',
      suggestedAction: 'Adjust section question counts or the pattern total.',
    });
  }

  // Section marks sum vs pattern total
  const sectionMSum = draft.sections.reduce((a, s) => a + (Number(s.marks) || 0), 0);
  if (draft.sections.length > 0 && sectionMSum !== draft.pattern.totalMarks) {
    issues.push({
      id: 'section-m-sum',
      severity: 'warning',
      title: 'Section marks do not match the total',
      description: `Sections sum to ${sectionMSum} marks but the pattern total is ${draft.pattern.totalMarks}.`,
      affectedEntity: 'sections',
      suggestedAction: 'Adjust section marks or the pattern total.',
    });
  }

  // Selected question count vs pattern total
  if (draft.selectedQuestionIds.length !== draft.pattern.totalQuestions) {
    issues.push({
      id: 'selected-q-count',
      severity: 'warning',
      title: 'Selected questions do not match the total',
      description: `${draft.selectedQuestionIds.length} questions selected but the pattern total is ${draft.pattern.totalQuestions}.`,
      affectedEntity: 'selectedQuestionIds',
      suggestedAction: 'Select the correct number of questions.',
    });
  }

  // Duplicate selected question IDs
  const seen = new Set<string>();
  const dupIds = new Set<string>();
  draft.selectedQuestionIds.forEach((id) => {
    if (seen.has(id)) dupIds.add(id);
    seen.add(id);
  });
  dupIds.forEach((id) => {
    issues.push({
      id: `dup-q-${id}`,
      severity: 'error',
      title: `Duplicate question selected: ${id}`,
      description: 'A question cannot appear more than once in a test.',
      affectedEntity: `selectedQuestionIds.${id}`,
      suggestedAction: 'Remove the duplicate question from the selection.',
    });
  });

  // Schedule validation
  if (draft.schedule.mode === 'scheduled') {
    if (!draft.schedule.publishAt) {
      issues.push({
        id: 'schedule-no-date',
        severity: 'error',
        title: 'Scheduled test has no publish date',
        description: 'A scheduled test requires a publish date and time.',
        affectedEntity: 'schedule.publishAt',
        suggestedAction: 'Set a publish date in the Schedule step.',
      });
    } else {
      const publishTime = new Date(draft.schedule.publishAt).getTime();
      if (Number.isNaN(publishTime)) {
        issues.push({
          id: 'schedule-invalid-date',
          severity: 'error',
          title: 'Publish date is invalid',
          description: 'The scheduled publish date could not be parsed.',
          affectedEntity: 'schedule.publishAt',
          suggestedAction: 'Set a valid publish date.',
        });
      } else if (publishTime < Date.now()) {
        issues.push({
          id: 'schedule-past',
          severity: 'error',
          title: 'Publish date is in the past',
          description: `The scheduled date ${draft.schedule.publishAt} has already passed.`,
          affectedEntity: 'schedule.publishAt',
          suggestedAction: 'Choose a future date and time.',
        });
      }
    }
  }

  // QA mode without reviewer
  if (draft.schedule.mode === 'qa' && !draft.schedule.reviewerId) {
    issues.push({
      id: 'qa-no-reviewer',
      severity: 'error',
      title: 'QA mode requires a reviewer',
      description: 'A reviewer must be assigned when submitting for QA.',
      affectedEntity: 'schedule.reviewerId',
      suggestedAction: 'Select a reviewer in the Schedule step.',
    });
  }

  return issues;
}

/** A draft may be published only when it has zero error-severity issues. */
export function canPublish(draft: TestDraft): boolean {
  return validateDraft(draft).every((i) => i.severity !== 'error');
}
