import { useMemo, useState } from 'react';
import {
  Sparkles, Wand2, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Pencil, FileText, ChevronDown, ChevronRight, Copy, Eye, Save, X, Layers,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GatedButton } from '@/components/shared/GatedAction';
import { showToast } from '@/components/shared/toast';
import { usePrototypeStore } from '@/app/store/PrototypeStore';
import { useGeneratedBatches } from '@/app/store/selectors';
import type { GeneratedBatch, GeneratedQuestion } from '@/app/store/types';
import type { Question } from '@/data/questions';
import { EXAMS, SUBJECTS, DIFFICULTIES } from '@/data/exams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const WORDS = ['CANDLE', 'BRIGHT', 'FLOWER', 'GARDEN', 'MARKET', 'SILVER', 'WINTER', 'SUMMER', 'NIGHT', 'MORNING'];
const TOPICS = ['RBI', 'Article 14', 'Mountbatten', 'NABARD', 'SEBI', 'Right to Equality', 'Independence Era', 'Constitution'];

const STEM_GENERATORS: Record<string, ((s: number) => string)[]> = {
  'Quantitative Aptitude': [
    (s) => `If the cost price of an article is Rs. ${(s % 500 + 100)} and it is sold at a profit of ${(s % 20 + 5)}%, find the selling price.`,
    (s) => `A sum of Rs. ${(s % 9000 + 1000)} amounts to Rs. ${((s % 9000 + 1000) + (s % 800 + 200))} in ${(s % 3 + 2)} years at simple interest. Find the rate per annum.`,
    (s) => `A train ${(s % 200 + 100)} m long running at ${(s % 80 + 30)} km/h crosses a pole in how many seconds?`,
    (s) => `The average of ${(s % 6 + 4)} consecutive even numbers is ${(s % 30 + 10)}. Find the largest number.`,
    (s) => `If ${(s % 9 + 2)}x - ${(s % 7 + 1)} = ${(s % 20 + 5)}, find the value of ${(s % 4 + 2)}x + ${(s % 3 + 1)}.`,
    (s) => `A shopkeeper marks his goods ${(s % 40 + 20)}% above cost and allows a discount of ${(s % 20 + 5)}%. His profit percentage is:`,
  ],
  'Reasoning Ability': [
    (s) => `In a certain code, FRIEND is written as GSJFOE. How is ${WORDS[s % WORDS.length]} written in that code?`,
    (_s) => `Pointing to a photograph, a man said, "She is the daughter of my grandfather's only son." How is the girl related to the man?`,
    (_s) => `Statements: All cats are dogs. All dogs are animals. Conclusions: I. All cats are animals. II. Some animals are cats. Which follows?`,
    (_s) => `If South-East becomes North and North-East becomes West, what will West become?`,
    (_s) => `Find the next number in the series: 2, 6, 12, 20, 30, ?`,
    (s) => `In a certain code, WORD is written as XPS${ (s % 4) + 1 }. How is ${WORDS[(s + 3) % WORDS.length]} written in that code?`,
  ],
  'English Language': [
    (s) => `Choose the synonym of "${['DILIGENT', 'ABUNDANT', 'BENEVOLENT', 'EPHEMERAL', 'PRUDENT'][s % 5]}":`,
    (_s) => `Select the correctly spelled word:`,
    (s) => `Choose the antonym of "${['BENEVOLENT', 'EPHEMERAL', 'ABUNDANT', 'DILIGENT'][s % 4]}":`,
    (_s) => `Fill in the blank: The proposal was met with ____ enthusiasm by the committee.`,
    (_s) => `Identify the part of speech of the underlined word: She runs <u>quickly</u>.`,
    (_s) => `Choose the correct meaning of the idiom "to bite the bullet":`,
  ],
  'General Awareness': [
    (s) => `Which of the following statements about ${TOPICS[s % TOPICS.length]} is correct?`,
    (_s) => `The Reserve Bank of India was established in the year:`,
    (_s) => `Which Article of the Indian Constitution deals with the Right to Equality?`,
    (_s) => `Who among the following was the first Governor-General of independent India?`,
    (_s) => `NABARD was established in which year?`,
    (_s) => `Which of the following is a fundamental duty under the Indian Constitution?`,
  ],
  'Computer Knowledge': [
    (_s) => `A computer's RAM is classified as which type of memory?`,
    (_s) => `Which protocol is used to transfer web pages?`,
    (_s) => `Which of the following is the fastest memory in a computer?`,
    (_s) => `A program that translates high-level language into machine language is called a:`,
    (_s) => `Which of the following is used to resolve domain names to IP addresses?`,
    (_s) => `Which of the following is NOT an operating system?`,
  ],
  'Punjabi Language': [
    (_s) => `ਹੇਠ ਦਿੱਤੇ ਸ਼ਬਦਾਂ ਵਿੱਚੋਂ ਸਹੀ ਸ਼ਬਦ-ਜੋੜ ਚੁਣੋ:`,
    (s) => `"${['ਪ੍ਰਸ਼ਾਸਨ', 'ਵਿਦਿਆਰਥੀ', 'ਅਧਿਆਪਕ', 'ਸਤਿਕਾਰ'][s % 4]}" ਸ਼ਬਦ ਦਾ ਸਹੀ ਅਰਥ ਕੀ ਹੈ?`,
    (_s) => `ਕਿਹੜਾ ਸ਼ਬਦ ਸੰਯੁਕਤ ਵਿਅੰਜਨ ਦੀ ਵਰਤੋਂ ਨਾਲ ਬਣਿਆ ਹੈ?`,
    (s) => `"${['ਪੰਜਾਬ', 'ਵਿਦਿਆ', 'ਅਧਿਆਪਕ', 'ਪ੍ਰਸ਼ਾਸਨ'][s % 4]}" ਸ਼ਬਦ ਦੀ ਸਹੀ ਸਪੈਲਿੰਗ ਚੁਣੋ:`,
  ],
  'Current Affairs': [
    (_s) => `India's Chandrayaan-3 successfully landed on the Moon in which month and year?`,
    (s) => `Which city hosted the G20 Summit in ${['2023', '2022', '2024'][s % 3]}?`,
    (_s) => `Which of the following events took place most recently?`,
    (s) => `Who was appointed as the Chief Justice of India in ${['2023', '2022'][s % 2]}?`,
    (s) => `The Summer Olympics ${['2024', '2028'][s % 2]} will be hosted by which city?`,
    (_s) => `Which Indian state recently launched a major welfare scheme?`,
  ],
};

const OPTION_SETS: Record<string, string[][]> = {
  'Quantitative Aptitude': [
    ['Rs. 120', 'Rs. 110', 'Rs. 105', 'Rs. 125'],
    ['10%', '8%', '12%', '15%'],
    ['10 sec', '8 sec', '12 sec', '15 sec'],
    ['22', '20', '24', '26'],
    ['23', '19', '21', '25'],
    ['15%', '10%', '20%', '12%'],
  ],
  'Reasoning Ability': [
    ['DBOEMF', 'DBPNFM', 'DCOEMF', 'DBOEMG'],
    ['Daughter', 'Sister', 'Niece', 'Cousin'],
    ['Both follow', 'Only I follows', 'Only II follows', 'Neither follows'],
    ['North-East', 'South-East', 'North-West', 'South-West'],
    ['42', '40', '44', '36'],
    ['XPS', 'YQT', 'ZRU', 'WPR'],
  ],
  'English Language': [
    ['Hardworking', 'Lazy', 'Careless', 'Slow'],
    ['Accommodation', 'Accomodation', 'Acommodation', 'Accommodaton'],
    ['Cruel', 'Kind', 'Generous', 'Warm'],
    ['mixed', 'little', 'much', 'no'],
    ['Adverb', 'Adjective', 'Noun', 'Verb'],
    ['To endure a painful situation', 'To eat quickly', 'To fight', 'To celebrate'],
  ],
  'General Awareness': [
    ['1935', '1947', '1950', '1969'],
    ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
    ['Lord Mountbatten', 'C. Rajagopalachari', 'Rajendra Prasad', 'Jawaharlal Nehru'],
    ['1982', '1969', '1975', '1991'],
    ['To safeguard public property', 'To pay taxes', 'To vote', 'To own property'],
    ['RBI', 'SBI', 'NABARD', 'SEBI'],
  ],
  'Computer Knowledge': [
    ['Volatile', 'Non-volatile', 'Read-only', 'Magnetic'],
    ['HTTP', 'FTP', 'SMTP', 'TCP'],
    ['Register', 'RAM', 'Cache', 'ROM'],
    ['Compiler', 'Interpreter', 'Assembler', 'Loader'],
    ['DNS', 'DHCP', 'NAT', 'VPN'],
    ['Microsoft Word', 'Linux', 'Windows', 'macOS'],
  ],
  'Punjabi Language': [
    ['ਪ੍ਰਸ਼ਾਸਨ', 'ਪ੍ਰਸ਼ਾਸਨ', 'ਪਰਸ਼ਾਸਨ', 'ਪ੍ਰਾਸਨ'],
    ['ਪ੍ਰਸ਼ਾਸਨ', 'ਪ੍ਰਸ਼ਾਸਨ', 'ਪਰਸ਼ਾਸਨ', 'ਪ੍ਰਾਸਨ'],
    ['ਪ੍ਰਸ਼ਾਸਨ', 'ਪਰਸ਼ਾਸਨ', 'ਪ੍ਰਸ਼ਾਸਨ', 'ਪ੍ਰਾਸਨ'],
    ['ਵਿਦਿਆਰਥੀ', 'ਵਿਦਆਰਥੀ', 'ਵਿਦਿਆਰਥੀ', 'ਵਿਦਆਰਥੀ'],
  ],
  'Current Affairs': [
    ['August 2023', 'July 2023', 'June 2023', 'September 2023'],
    ['New Delhi', 'Mumbai', 'Chennai', 'Kolkata'],
    ['Chandrayaan-3 landing', 'Gaganyaan launch', 'Mangalyaan orbit', 'Chandrayaan-2 launch'],
    ['Justice D. Y. Chandrachud', 'Justice U. U. Lalit', 'Justice N. V. Ramana', 'Justice S. A. Bobde'],
    ['Paris', 'Tokyo', 'Beijing', 'Los Angeles'],
    ['Rajasthan', 'Maharashtra', 'Tamil Nadu', 'Kerala'],
  ],
};

const EXPLANATION_GENERATORS: Record<string, ((s: number) => string)[]> = {
  'Quantitative Aptitude': [
    (s) => `Let CP = ${(s % 500 + 100)}. Profit% = ${(s % 20 + 5)}%. SP = CP × (1 + P/100) = ${(s % 500 + 100)} × ${(1 + (s % 20 + 5) / 100).toFixed(2)}.`,
    (_s) => `Using SI = P×R×T/100, rate = (SI × 100)/(P × T). Substituting the given values yields the result.`,
    (s) => `Speed = ${(s % 80 + 30)} km/h = ${(s % 80 + 30) * (5 / 18)} m/s. Time = Distance/Speed.`,
    (s) => `For consecutive even numbers with average A, the largest = A + (n-1). Here A = ${(s % 30 + 10)}.`,
    (_s) => `Solve for x first, then substitute into the second expression.`,
    (s) => `Let CP = 100. MP = ${(s % 40 + 120)}. SP = MP × (1 - d/100). Profit = SP - CP.`,
  ],
  'Reasoning Ability': [
    () => `Each letter is shifted by +1 in the alphabet to form the code.`,
    () => `Grandfather's only son = the man's father. Father's daughter = his own daughter.`,
    () => `By transitivity, all cats are animals (I). Since cats exist, some animals are cats (II) is valid.`,
    () => `Rotate the directions: each direction shifts by 135° clockwise.`,
    (_s) => `The differences are 4, 6, 8, 10 — increasing by 2. Next difference is 12, so 30 + 12 = ${30 + 12}.`,
    () => `Apply the same letter-shifting rule used in the example.`,
  ],
  'English Language': [
    () => `Diligent means showing care and conscientious effort — hardworking.`,
    () => `The correct spelling is "Accommodation" — double c and double m.`,
    () => `The antonym of a benevolent (kind) person is cruel.`,
    () => `"Mixed enthusiasm" is the standard collocation for a varied response.`,
    () => `"Quickly" modifies the verb "runs", so it is an adverb.`,
    () => `"To bite the bullet" means to face a difficult or unpleasant situation bravely.`,
  ],
  'General Awareness': [
    () => `The RBI was established on 1 April 1935 under the RBI Act, 1934.`,
    () => `Article 14 guarantees equality before law and equal protection of laws.`,
    () => `Lord Mountbatten was the first Governor-General of independent India (1947-48).`,
    () => `NABARD was established on 12 July 1982.`,
    () => `Safeguarding public property is a fundamental duty under Article 51A.`,
    () => `The RBI is the central banking institution of India.`,
  ],
  'Computer Knowledge': [
    () => `RAM is volatile — its contents are lost when power is switched off.`,
    () => `HTTP (HyperText Transfer Protocol) is used to transfer web pages.`,
    () => `Registers are the fastest, located inside the CPU.`,
    () => `A compiler translates an entire high-level program into machine code at once.`,
    () => `DNS (Domain Name System) resolves domain names to IP addresses.`,
    () => `Microsoft Word is an application, not an operating system.`,
  ],
  'Punjabi Language': [
    () => `ਪ੍ਰਸ਼ਾਸਨ (administration) is the correct spelling with the conjunct consonant.`,
    () => `ਪ੍ਰਸ਼ਾਸਨ ਦਾ ਅਰਥ ਹੈ ਪ੍ਰਸ਼ਾਸਨ (administration)।`,
    () => `ਸੰਯੁਕਤ ਵਿਅੰਜਨ ਦੋ ਵਿਅੰਜਨਾਂ ਦੇ ਜੁੜਨ ਨਾਲ ਬਣਦਾ ਹੈ।`,
    () => `ਵਿਦਿਆਰਥੀ ਸ਼ਬਦ ਵਿੱਚ ਸਹੀ ਸਪੈਲਿੰਗ ਹੈ।`,
  ],
  'Current Affairs': [
    () => `Chandrayaan-3 landed on the Moon's south pole on 23 August 2023.`,
    () => `India hosted the G20 Summit in New Delhi in September 2023.`,
    () => `Chandrayaan-3's landing was the most recent milestone among the options.`,
    () => `Justice D. Y. Chandrachud was appointed CJI in November 2022.`,
    () => `Paris will host the Summer Olympics in 2024.`,
    () => `Rajasthan launched a major welfare scheme recently.`,
  ],
};

function generateMockStem(subject: string, seed: number): string {
  const fns = STEM_GENERATORS[subject] ?? STEM_GENERATORS['General Awareness'];
  return fns[Math.abs(seed) % fns.length](seed);
}

function generateMockOption(subject: string, idx: number, seed: number): string {
  const sets = OPTION_SETS[subject] ?? OPTION_SETS['General Awareness'];
  const set = sets[Math.abs(seed) % sets.length];
  return set[idx % set.length];
}

function generateMockExplanation(subject: string, seed: number): string {
  const fns = EXPLANATION_GENERATORS[subject] ?? EXPLANATION_GENERATORS['General Awareness'];
  return fns[Math.abs(seed) % fns.length](seed);
}

function computeBatchStatus(qs: GeneratedQuestion[]): GeneratedBatch['status'] {
  if (qs.length === 0) return 'Unreviewed';
  if (qs.every((q) => q.status === 'Approved')) return 'Approved';
  if (qs.every((q) => q.status === 'Rejected')) return 'Rejected';
  const anyReviewed = qs.some((q) => q.status === 'Approved' || q.status === 'Rejected' || q.status === 'Needs Fix');
  return anyReviewed ? 'In Review' : 'Unreviewed';
}

function batchStatusTone(status: GeneratedBatch['status']): 'default' | 'info' | 'success' | 'destructive' {
  switch (status) {
    case 'In Review': return 'info';
    case 'Approved': return 'success';
    case 'Rejected': return 'destructive';
    default: return 'default';
  }
}

function gqStatusTone(status: GeneratedQuestion['status']): 'default' | 'warning' | 'success' | 'destructive' {
  switch (status) {
    case 'Needs Fix': return 'warning';
    case 'Approved': return 'success';
    case 'Rejected': return 'destructive';
    default: return 'default';
  }
}

interface EditDraft {
  questionId: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOption: string;
  explanation: string;
}

export function QuestionStudioPage() {
  const { dispatch, audit, activeAdminName } = usePrototypeStore();
  const batches = useGeneratedBatches();

  const [selectedExam, setSelectedExam] = useState<string>(EXAMS[0].code);
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(DIFFICULTIES[1]);
  const [count, setCount] = useState<number>(8);
  const [loading, setLoading] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [showOriginalId, setShowOriginalId] = useState<string | null>(null);

  const counts = useMemo(() => {
    let approved = 0, rejected = 0, needsFix = 0, unreviewed = 0;
    for (const b of batches) {
      for (const q of b.questions) {
        if (q.status === 'Approved') approved += 1;
        else if (q.status === 'Rejected') rejected += 1;
        else if (q.status === 'Needs Fix') needsFix += 1;
        else unreviewed += 1;
      }
    }
    return { approved, rejected, needsFix, unreviewed };
  }, [batches]);

  const generate = () => {
    const safeCount = Math.min(20, Math.max(5, count));
    setLoading(true);
    setTimeout(() => {
      const batchId = `BAT-${Date.now()}`;
      const seed = Math.floor(Math.random() * 100000);
      const questions: GeneratedQuestion[] = Array.from({ length: safeCount }).map((_, i) => ({
        id: `GQ-${Date.now()}-${i}`,
        batchId,
        seed: seed + i,
        stem: generateMockStem(selectedSubject, seed + i),
        options: [
          { id: 'A', text: generateMockOption(selectedSubject, 0, seed + i) },
          { id: 'B', text: generateMockOption(selectedSubject, 1, seed + i) },
          { id: 'C', text: generateMockOption(selectedSubject, 2, seed + i) },
          { id: 'D', text: generateMockOption(selectedSubject, 3, seed + i) },
        ],
        correctOption: 'A',
        explanation: generateMockExplanation(selectedSubject, seed + i),
        status: 'Unreviewed' as const,
      }));
      const batch: GeneratedBatch = {
        id: batchId,
        createdAt: new Date().toISOString(),
        exam: selectedExam,
        subject: selectedSubject,
        difficulty: selectedDifficulty,
        count: safeCount,
        seed,
        questions,
        status: 'Unreviewed' as const,
      };
      const entry = audit('BATCH_GENERATED', 'audit', batchId, `Batch ${batchId.slice(-4)}`, '-', `${safeCount} questions`, `Generated ${safeCount} ${selectedSubject} questions for ${selectedExam}`);
      dispatch({ type: 'ADD_GENERATED_BATCH', batch, audit: entry });
      setExpandedBatchId(batchId);
      setLoading(false);
      showToast.success('Batch generated', `${safeCount} questions ready for review.`);
    }, 1400);
  };

  const updateBatch = (batch: GeneratedBatch) => {
    dispatch({ type: 'UPDATE_GENERATED_BATCH', batch });
  };

  const updateQuestion = (batch: GeneratedBatch, questionId: string, updater: (q: GeneratedQuestion) => GeneratedQuestion) => {
    const questions = batch.questions.map((q) => (q.id === questionId ? updater(q) : q));
    updateBatch({ ...batch, questions, status: computeBatchStatus(questions) });
  };

  const regenerateStem = (batch: GeneratedBatch, q: GeneratedQuestion) => {
    const newSeed = q.seed + 1;
    updateQuestion(batch, q.id, (cur) => ({
      ...cur,
      seed: newSeed,
      originalStem: cur.originalStem ?? cur.stem,
      stem: generateMockStem(batch.subject, newSeed),
    }));
    showToast.info('Stem regenerated', 'A new variation has been generated.');
  };

  const regenerateOptions = (batch: GeneratedBatch, q: GeneratedQuestion) => {
    const newSeed = q.seed + 1;
    updateQuestion(batch, q.id, (cur) => ({
      ...cur,
      seed: newSeed,
      originalOptions: cur.originalOptions ?? cur.options,
      options: [
        { id: 'A', text: generateMockOption(batch.subject, 0, newSeed) },
        { id: 'B', text: generateMockOption(batch.subject, 1, newSeed) },
        { id: 'C', text: generateMockOption(batch.subject, 2, newSeed) },
        { id: 'D', text: generateMockOption(batch.subject, 3, newSeed) },
      ],
    }));
    showToast.info('Options regenerated', 'New option set has been generated.');
  };

  const regenerateExplanation = (batch: GeneratedBatch, q: GeneratedQuestion) => {
    const newSeed = q.seed + 1;
    updateQuestion(batch, q.id, (cur) => ({
      ...cur,
      seed: newSeed,
      originalExplanation: cur.originalExplanation ?? cur.explanation,
      explanation: generateMockExplanation(batch.subject, newSeed),
    }));
    showToast.info('Explanation regenerated', 'A new explanation has been generated.');
  };

  const duplicateVariation = (batch: GeneratedBatch, q: GeneratedQuestion) => {
    const copy: GeneratedQuestion = {
      ...q,
      id: `GQ-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      status: 'Unreviewed',
      originalStem: undefined,
      originalOptions: undefined,
      originalExplanation: undefined,
    };
    const questions = [...batch.questions, copy];
    updateBatch({ ...batch, questions, status: computeBatchStatus(questions) });
    showToast.success('Variation duplicated', 'A new unreviewed copy was added to the batch.');
  };

  const approveToBank = (batch: GeneratedBatch, q: GeneratedQuestion) => {
    const question: Question = {
      id: `Q-${Date.now()}`,
      stem: q.stem,
      stemPunjabi: undefined,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      correctOption: q.correctOption,
      explanation: q.explanation,
      subject: batch.subject,
      chapter: 'Generated',
      topic: 'AI Generated',
      subtopic: 'Batch ' + batch.id.slice(-4),
      difficulty: batch.difficulty,
      language: ['English'],
      exam: batch.exam,
      type: 'MCQ Single',
      status: 'Approved',
      source: 'AI Generated',
      author: activeAdminName,
      reviewer: activeAdminName,
      validationStatus: 'Passed',
      validationScore: 75 + (q.seed % 20),
      usageCount: 0,
      studentAccuracy: 0,
      avgResponseSec: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    const entry = audit('QUESTION_APPROVED_FROM_STUDIO', 'question', question.id, q.stem.slice(0, 40), q.status, 'Approved', 'Question approved from Studio and added to the bank');
    dispatch({ type: 'ADD_QUESTION', question, audit: entry });
    updateQuestion(batch, q.id, (cur) => ({ ...cur, status: 'Approved' }));
    showToast.success('Approved to Question Bank', `${question.id} added to the question bank.`);
  };

  const setStatus = (batch: GeneratedBatch, q: GeneratedQuestion, status: GeneratedQuestion['status'], label: string) => {
    updateQuestion(batch, q.id, (cur) => ({ ...cur, status }));
    if (status === 'Rejected') showToast.error('Question rejected', label);
    else if (status === 'Needs Fix') showToast.warning('Marked for fix', label);
    else showToast.success(label, 'Question status updated.');
  };

  const startEdit = (q: GeneratedQuestion) => {
    setEditDraft({
      questionId: q.id,
      stem: q.stem,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      correctOption: q.correctOption,
      explanation: q.explanation,
    });
  };

  const saveEdit = (batch: GeneratedBatch) => {
    if (!editDraft) return;
    updateQuestion(batch, editDraft.questionId, (cur) => ({
      ...cur,
      stem: editDraft.stem,
      options: editDraft.options,
      correctOption: editDraft.correctOption,
      explanation: editDraft.explanation,
    }));
    setEditDraft(null);
    showToast.success('Question saved', 'Edits applied to the generated question.');
  };

  const examName = (code: string) => EXAMS.find((e) => e.code === code)?.name ?? code;

  return (
    <div>
      <PageHeader
        title="Question Studio"
        description="AI-assisted question generation — review, refine and approve into the Question Bank."
        icon={<Sparkles className="h-5 w-5" />}
        actions={<Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/10 px-3 py-1 text-primary"><Sparkles className="h-3.5 w-3.5" /> Visual Prototype</Badge>}
      />

      <Card className="mb-4">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Generation Config</CardTitle>
          <Badge variant="secondary" className="gap-1.5 text-[10px]">
            <Layers className="h-3 w-3" /> {batches.length} batch{batches.length === 1 ? '' : 'es'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="mb-1.5 block text-xs">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{EXAMS.map((e) => <SelectItem key={e.code} value={e.code}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Number of Questions (5-20)</Label>
              <Input
                type="number"
                min={5}
                max={20}
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(5, Number(e.target.value) || 5)))}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Generates a deterministic mock batch using seeded templates. Approved questions are added to the Question Bank.
            </p>
            <GatedButton permission="studio.use" onClick={generate} disabled={loading} size="default" className="sm:w-auto">
              {loading ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate Batch</>}
            </GatedButton>
          </div>
        </CardContent>
      </Card>

      {batches.length > 0 && (
        <Card className="mb-4">
          <CardContent className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
            <Stat label="Total Batches" value={batches.length} />
            <Stat label="Approved" value={counts.approved} tone="text-success" />
            <Stat label="Rejected" value={counts.rejected} tone="text-destructive" />
            <Stat label="Needs Fix" value={counts.needsFix} tone="text-warning" />
            <Stat label="Unreviewed" value={counts.unreviewed} tone="text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {batches.length === 0 && !loading && (
          <EmptyState
            icon={<Sparkles className="h-7 w-7" />}
            title="No questions generated yet"
            description="Configure the parameters above and click Generate Batch to produce AI-assisted questions for review."
            action={
              <GatedButton permission="studio.use" onClick={generate} variant="outline" size="sm">
                <Wand2 className="mr-1.5 h-4 w-4" /> Generate First Batch
              </GatedButton>
            }
          />
        )}

        {loading && (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><RefreshCw className="h-7 w-7 animate-spin" /></div>
              <div>
                <p className="font-display text-lg font-semibold text-foreground">Generating questions…</p>
                <p className="mt-1 text-sm text-muted-foreground">AI is composing {count} questions for {selectedSubject}</p>
              </div>
              <Progress value={66} className="mt-2 max-w-xs" />
            </div>
          </Card>
        )}

        {batches.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            examName={examName(batch.exam)}
            expanded={expandedBatchId === batch.id}
            onToggle={() => setExpandedBatchId((cur) => (cur === batch.id ? null : batch.id))}
            editDraft={editDraft}
            showOriginalId={showOriginalId}
            onStartEdit={startEdit}
            onCancelEdit={() => setEditDraft(null)}
            onSaveEdit={() => saveEdit(batch)}
            onUpdateEditDraft={setEditDraft}
            onToggleOriginal={(id) => setShowOriginalId((cur) => (cur === id ? null : id))}
            onRegenerateStem={(q) => regenerateStem(batch, q)}
            onRegenerateOptions={(q) => regenerateOptions(batch, q)}
            onRegenerateExplanation={(q) => regenerateExplanation(batch, q)}
            onDuplicate={(q) => duplicateVariation(batch, q)}
            onApprove={(q) => approveToBank(batch, q)}
            onReject={(q) => setStatus(batch, q, 'Rejected', 'Question rejected')}
            onNeedsFix={(q) => setStatus(batch, q, 'Needs Fix', 'Marked for fix')}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">Visual prototype only — no real AI generation is performed. All content is mock data derived from seeded templates.</p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 text-lg font-bold', tone ?? 'text-foreground')}>{value}</p>
    </div>
  );
}

interface BatchCardProps {
  batch: GeneratedBatch;
  examName: string;
  expanded: boolean;
  onToggle: () => void;
  editDraft: EditDraft | null;
  showOriginalId: string | null;
  onStartEdit: (q: GeneratedQuestion) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onUpdateEditDraft: (d: EditDraft) => void;
  onToggleOriginal: (id: string) => void;
  onRegenerateStem: (q: GeneratedQuestion) => void;
  onRegenerateOptions: (q: GeneratedQuestion) => void;
  onRegenerateExplanation: (q: GeneratedQuestion) => void;
  onDuplicate: (q: GeneratedQuestion) => void;
  onApprove: (q: GeneratedQuestion) => void;
  onReject: (q: GeneratedQuestion) => void;
  onNeedsFix: (q: GeneratedQuestion) => void;
}

function BatchCard({
  batch, examName, expanded, onToggle, editDraft, showOriginalId,
  onStartEdit, onCancelEdit, onSaveEdit, onUpdateEditDraft, onToggleOriginal,
  onRegenerateStem, onRegenerateOptions, onRegenerateExplanation, onDuplicate,
  onApprove, onReject, onNeedsFix,
}: BatchCardProps) {
  const approved = batch.questions.filter((q) => q.status === 'Approved').length;
  const rejected = batch.questions.filter((q) => q.status === 'Rejected').length;
  const needsFix = batch.questions.filter((q) => q.status === 'Needs Fix').length;
  const unreviewed = batch.questions.filter((q) => q.status === 'Unreviewed').length;

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 p-4 text-left">
            {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-foreground">{batch.id}</span>
                <StatusBadge tone={batchStatusTone(batch.status)} dot className="text-[10px]">{batch.status}</StatusBadge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {examName} · {batch.subject} · {batch.difficulty} · {batch.count} questions · {new Date(batch.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <MiniStat label="Approved" value={approved} tone="text-success" />
              <MiniStat label="Rejected" value={rejected} tone="text-destructive" />
              <MiniStat label="Fix" value={needsFix} tone="text-warning" />
              <MiniStat label="New" value={unreviewed} tone="text-muted-foreground" />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 border-t pt-4">
            <div className="flex flex-wrap gap-2 sm:hidden">
              <MiniStat label="Approved" value={approved} tone="text-success" />
              <MiniStat label="Rejected" value={rejected} tone="text-destructive" />
              <MiniStat label="Fix" value={needsFix} tone="text-warning" />
              <MiniStat label="New" value={unreviewed} tone="text-muted-foreground" />
            </div>
            {batch.questions.map((q, i) => (
              <QuestionItem
                key={q.id}
                index={i}
                question={q}
                editDraft={editDraft}
                showOriginal={showOriginalId === q.id}
                onStartEdit={() => onStartEdit(q)}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onUpdateEditDraft={onUpdateEditDraft}
                onToggleOriginal={() => onToggleOriginal(q.id)}
                onRegenerateStem={() => onRegenerateStem(q)}
                onRegenerateOptions={() => onRegenerateOptions(q)}
                onRegenerateExplanation={() => onRegenerateExplanation(q)}
                onDuplicate={() => onDuplicate(q)}
                onApprove={() => onApprove(q)}
                onReject={() => onReject(q)}
                onNeedsFix={() => onNeedsFix(q)}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-muted/30 px-2.5 py-1">
      <span className={cn('text-sm font-bold', tone)}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

interface QuestionItemProps {
  index: number;
  question: GeneratedQuestion;
  editDraft: EditDraft | null;
  showOriginal: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onUpdateEditDraft: (d: EditDraft) => void;
  onToggleOriginal: () => void;
  onRegenerateStem: () => void;
  onRegenerateOptions: () => void;
  onRegenerateExplanation: () => void;
  onDuplicate: () => void;
  onApprove: () => void;
  onReject: () => void;
  onNeedsFix: () => void;
}

function QuestionItem({
  index, question, editDraft, showOriginal,
  onStartEdit, onCancelEdit, onSaveEdit, onUpdateEditDraft, onToggleOriginal,
  onRegenerateStem, onRegenerateOptions, onRegenerateExplanation, onDuplicate,
  onApprove, onReject, onNeedsFix,
}: QuestionItemProps) {
  const isEditing = editDraft?.questionId === question.id;
  const hasOriginal = !!(question.originalStem || question.originalOptions || question.originalExplanation);

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
          <StatusBadge tone={gqStatusTone(question.status)} dot className="text-[10px]">{question.status}</StatusBadge>
          {hasOriginal && <Badge variant="outline" className="text-[10px]">Regenerated</Badge>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <GatedButton permission="questions.edit" onClick={onStartEdit} variant="outline" size="sm" className="h-7 text-xs" disabled={isEditing}>
            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
          </GatedButton>
        </div>
      </div>

      {isEditing && editDraft ? (
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs">Stem</Label>
            <Textarea
              value={editDraft.stem}
              onChange={(e) => onUpdateEditDraft({ ...editDraft, stem: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {editDraft.options.map((o) => (
              <div key={o.id} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">{o.id}</span>
                <Input value={o.text} onChange={(e) => onUpdateEditDraft({ ...editDraft, options: editDraft.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} className="h-8 text-sm" />
              </div>
            ))}
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Correct Option</Label>
            <Select value={editDraft.correctOption} onValueChange={(v) => onUpdateEditDraft({ ...editDraft, correctOption: v })}>
              <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {editDraft.options.map((o) => <SelectItem key={o.id} value={o.id}>Option {o.id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Explanation</Label>
            <Textarea value={editDraft.explanation} onChange={(e) => onUpdateEditDraft({ ...editDraft, explanation: e.target.value })} rows={2} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onSaveEdit}><Save className="mr-1.5 h-3.5 w-3.5" /> Save</Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}><X className="mr-1.5 h-3.5 w-3.5" /> Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-foreground">{question.stem}</p>
          <div className="mt-2 space-y-1.5">
            {question.options.map((o) => {
              const correct = o.id === question.correctOption;
              return (
                <div key={o.id} className={cn('flex items-center gap-2 rounded-lg border p-2 text-sm', correct ? 'border-success/40 bg-success/10' : 'bg-card')}>
                  <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold', correct ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground')}>{o.id}</span>
                  <span className={cn(correct && 'font-medium text-foreground')}>{o.text}</span>
                  {correct && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
                </div>
              );
            })}
          </div>
          <div className="mt-2 rounded-lg border bg-muted/30 p-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><FileText className="h-3.5 w-3.5" /> Explanation</div>
            <p className="text-sm leading-relaxed text-foreground">{question.explanation}</p>
          </div>

          {hasOriginal && showOriginal && (
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {question.originalStem && (
                <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-2.5">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Original Stem</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{question.originalStem}</p>
                </div>
              )}
              {question.originalOptions && (
                <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-2.5">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Original Options</p>
                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                    {question.originalOptions.map((o) => <li key={o.id}><span className="font-bold">{o.id}.</span> {o.text}</li>)}
                  </ul>
                </div>
              )}
              {question.originalExplanation && (
                <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-2.5">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Original Explanation</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{question.originalExplanation}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onRegenerateStem}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Stem</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onRegenerateOptions}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Options</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onRegenerateExplanation}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Explanation</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onDuplicate}><Copy className="mr-1 h-3.5 w-3.5" /> Duplicate</Button>
            {hasOriginal && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onToggleOriginal}>
                <Eye className="mr-1 h-3.5 w-3.5" /> {showOriginal ? 'Hide Original' : 'View Original'}
              </Button>
            )}
            <div className="ml-auto flex flex-wrap gap-1.5">
              <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={onNeedsFix} disabled={question.status === 'Needs Fix'}><AlertTriangle className="mr-1 h-3.5 w-3.5" /> Needs Fix</Button>
              <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={onReject} disabled={question.status === 'Rejected'}><XCircle className="mr-1 h-3.5 w-3.5" /> Reject</Button>
              <GatedButton permission="questions.review" onClick={onApprove} variant="default" size="sm" className="h-7 text-xs" disabled={question.status === 'Approved'}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
              </GatedButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
