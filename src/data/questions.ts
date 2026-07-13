import { EXAMS, SUBJECTS, DIFFICULTIES, LANGUAGES, QUESTION_TYPES, QUESTION_STATUSES, ADMIN_NAMES, REVIEWERS } from './exams';

export interface Question {
  id: string; stem: string; stemPunjabi?: string;
  options: { id: string; text: string; textPunjabi?: string }[];
  correctOption: string; explanation: string;
  subject: string; chapter: string; topic: string; subtopic: string;
  difficulty: string; language: string[]; exam: string; type: string;
  status: string; source: string; author: string; reviewer: string | null;
  validationStatus: 'Passed' | 'Issues' | 'Pending'; validationScore: number;
  usageCount: number; studentAccuracy: number; avgResponseSec: number;
  createdAt: string; updatedAt: string;
}

const STEMS = [
  { stem: 'A shopkeeper marks his goods 40% above cost price and allows a discount of 25%. His profit percentage is:', options: ['5%', '8%', '10%', '15%'], correct: 0, explanation: 'Let CP = 100. MP = 140. SP = 140 × 0.75 = 105. Profit = 5%.', subject: 'Quantitative Aptitude', chapter: 'Profit & Loss', topic: 'Successive Discount', subtopic: 'Marked Price' },
  { stem: 'If the simple interest on a sum for 2 years at 8% per annum is Rs 1,600, the principal amount is:', options: ['Rs 8,000', 'Rs 10,000', 'Rs 12,000', 'Rs 6,000'], correct: 1, explanation: 'SI = P × R × T / 100, so 1600 = P × 8 × 2 / 100, P = 10,000.', subject: 'Quantitative Aptitude', chapter: 'Simple & Compound Interest', topic: 'Simple Interest', subtopic: 'Finding Principal' },
  { stem: 'A train 150 m long running at 54 km/h crosses a pole in:', options: ['8 sec', '10 sec', '12 sec', '15 sec'], correct: 1, explanation: 'Speed = 54 × 5/18 = 15 m/s. Time = 150/15 = 10 sec.', subject: 'Quantitative Aptitude', chapter: 'Time, Speed & Distance', topic: 'Train Problems', subtopic: 'Crossing a Pole' },
  { stem: 'In a certain code, FRIEND is written as GSJFOE. How is CANDLE written in that code?', options: ['DBOEMF', 'DBPNFM', 'DCOEMF', 'DBOEMG'], correct: 0, explanation: 'Each letter is shifted by +1: F->G, R->S, I->J, E->F, N->O, D->E.', subject: 'Reasoning Ability', chapter: 'Coding-Decoding', topic: 'Letter Coding', subtopic: 'Forward Shift' },
  { stem: 'Pointing to a photograph, a man said, "She is the daughter of my grandfather\'s only son." How is the girl related to the man?', options: ['Sister', 'Daughter', 'Niece', 'Cousin'], correct: 1, explanation: "Grandfather's only son = the man's father. Father's daughter = his own daughter.", subject: 'Reasoning Ability', chapter: 'Blood Relations', topic: 'Generation Tree', subtopic: 'Photograph Reference' },
  { stem: 'Choose the correctly spelled word:', options: ['Accomodation', 'Accommodation', 'Acommodation', 'Accommodaton'], correct: 1, explanation: 'The correct spelling is "Accommodation" — double c and double m.', subject: 'English Language', chapter: 'Spelling', topic: 'Common Errors', subtopic: 'Double Consonants' },
  { stem: 'Select the synonym of "DILIGENT":', options: ['Lazy', 'Hardworking', 'Careless', 'Slow'], correct: 1, explanation: 'Diligent means showing care and conscientious effort — hardworking.', subject: 'English Language', chapter: 'Vocabulary', topic: 'Synonyms', subtopic: 'Adjectives' },
  { stem: 'Who among the following was the first Governor-General of independent India?', options: ['C. Rajagopalachari', 'Lord Mountbatten', 'Rajendra Prasad', 'Jawaharlal Nehru'], correct: 1, explanation: 'Lord Mountbatten was the first Governor-General of independent India (1947-48).', subject: 'General Awareness', chapter: 'Modern History', topic: 'Independence Era', subtopic: 'Governor-General' },
  { stem: 'The Reserve Bank of India was established in the year:', options: ['1935', '1947', '1950', '1969'], correct: 0, explanation: 'The RBI was established on 1 April 1935 under the RBI Act, 1934.', subject: 'General Awareness', chapter: 'Banking Awareness', topic: 'RBI', subtopic: 'Establishment' },
  { stem: 'Which Article of the Indian Constitution deals with the Right to Equality?', options: ['Article 14', 'Article 19', 'Article 21', 'Article 32'], correct: 0, explanation: 'Article 14 guarantees equality before law and equal protection of laws.', subject: 'General Awareness', chapter: 'Polity', topic: 'Fundamental Rights', subtopic: 'Right to Equality' },
  { stem: "A computer's RAM is classified as which type of memory?", options: ['Non-volatile', 'Volatile', 'Read-only', 'Magnetic'], correct: 1, explanation: 'RAM is volatile — its contents are lost when power is switched off.', subject: 'Computer Knowledge', chapter: 'Hardware', topic: 'Memory', subtopic: 'RAM vs ROM' },
  { stem: 'Which of the following words is correctly spelled in Punjabi?', options: ['ਪ੍ਰਸ਼ਾਸਨ', 'ਪ੍ਰਸ਼ਾਸਨ', 'ਪਰਸ਼ਾਸਨ', 'ਪ੍ਰਾਸਨ'], correct: 0, explanation: 'ਪ੍ਰਸ਼ਾਸਨ (administration) is the correct spelling with the conjunct consonant.', subject: 'Punjabi Language', chapter: 'ਵਿਆਕਰਨ (Grammar)', topic: 'ਸ਼ਬਦ-ਜੋੜ (Spelling)', subtopic: 'ਸੰਯੁਕਤ ਵਿਅੰਜਨ' },
  { stem: 'The average of five consecutive even numbers is 18. The largest number is:', options: ['20', '22', '24', '26'], correct: 1, explanation: 'Let numbers be x, x+2, x+4, x+6, x+8. Average = x+4 = 18, so x = 14. Largest = 22.', subject: 'Quantitative Aptitude', chapter: 'Average', topic: 'Number Sequences', subtopic: 'Consecutive Evens' },
  { stem: 'If 3x - 2 = 13, then the value of 4x + 3 is:', options: ['19', '21', '23', '25'], correct: 2, explanation: '3x = 15, x = 5. 4(5) + 3 = 23.', subject: 'Quantitative Aptitude', chapter: 'Linear Equations', topic: 'Single Variable', subtopic: 'Substitution' },
  { stem: 'Statements: All cats are dogs. All dogs are animals. Conclusions: I. All cats are animals. II. Some animals are cats.', options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'], correct: 2, explanation: 'By transitivity, all cats are animals (I). Since cats exist, some animals are cats (II) is valid.', subject: 'Reasoning Ability', chapter: 'Syllogism', topic: 'Logical Deduction', subtopic: 'Three Statements' },
];

const SOURCES = ['In-house Author', 'Previous Year', 'External Vendor', 'AI Generated', 'Community Contribution'];
const EXAM_CODES = EXAMS.map((e) => e.code);
const pick = <T,>(arr: readonly T[], i: number): T => arr[i % arr.length];

export const QUESTIONS: Question[] = Array.from({ length: 48 }).map((_, i) => {
  const tmpl = STEMS[i % STEMS.length];
  const status = pick(QUESTION_STATUSES, i * 3 + (i % 5));
  const langSet: string[] = ['English'];
  if (tmpl.subject === 'Punjabi Language' || i % 4 === 0) langSet.push('Punjabi');
  if (i % 3 === 0) langSet.push('Hindi');

  return {
    id: `Q-${(1000 + i).toString()}`, stem: tmpl.stem,
    stemPunjabi: langSet.includes('Punjabi') ? tmpl.stem : undefined,
    options: tmpl.options.map((text, oi) => ({ id: String.fromCharCode(65 + oi), text, textPunjabi: langSet.includes('Punjabi') ? text : undefined })),
    correctOption: String.fromCharCode(65 + tmpl.correct),
    explanation: tmpl.explanation, subject: tmpl.subject, chapter: tmpl.chapter,
    topic: tmpl.topic, subtopic: tmpl.subtopic, difficulty: pick(DIFFICULTIES, i),
    language: langSet, exam: pick(EXAM_CODES, i * 2), type: pick(QUESTION_TYPES, i),
    status, source: pick(SOURCES, i), author: pick(ADMIN_NAMES, i),
    reviewer: status === 'Draft' ? null : pick(REVIEWERS, i),
    validationStatus: status === 'Approved' ? 'Passed' : status === 'Needs Fix' ? 'Issues' : 'Pending',
    validationScore: status === 'Approved' ? 80 + ((i * 7) % 20) : 40 + ((i * 11) % 40),
    usageCount: (i * 13) % 120, studentAccuracy: 45 + ((i * 17) % 50),
    avgResponseSec: 20 + ((i * 9) % 80),
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString().slice(0, 10),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  };
});

export const FILTER_EXAMS = EXAMS.map((e) => ({ label: e.name, value: e.code }));
export const FILTER_SUBJECTS = SUBJECTS.map((s) => ({ label: s, value: s }));
export const FILTER_DIFFICULTY = DIFFICULTIES.map((d) => ({ label: d, value: d }));
export const FILTER_LANGUAGE = LANGUAGES.map((l) => ({ label: l, value: l }));
export const FILTER_STATUS = QUESTION_STATUSES.map((s) => ({ label: s, value: s }));
export const FILTER_QTYPE = QUESTION_TYPES.map((t) => ({ label: t, value: t }));
