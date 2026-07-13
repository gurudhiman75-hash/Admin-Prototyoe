import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type Column } from '@/components/shared/DataTable';

interface Row {
  id: string;
  name: string;
  score: number;
}

const DATA: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: `R-${i + 1}`,
  name: `Item ${String.fromCharCode(65 + (i % 26))}${i}`,
  score: (i % 10) * 10,
}));

const COLUMNS: Column<Row>[] = [
  { key: 'name', header: 'Name', cell: (r) => r.name, sortValue: (r) => r.name },
  { key: 'score', header: 'Score', cell: (r) => r.score, sortValue: (r) => r.score },
];

function renderTable(overrides?: { pageSize?: number; data?: Row[] }) {
  return render(
    <DataTable<Row>
      data={overrides?.data ?? DATA}
      columns={COLUMNS}
      getRowId={(r) => r.id}
      searchable
      searchKeys={(r) => `${r.name} ${r.score}`}
      pageSize={overrides?.pageSize ?? 10}
      selectable={false}
    />,
  );
}

/** Count the data rows rendered on the current page (excludes the empty-state row). */
function dataRowCount(): number {
  const body = document.querySelector('tbody');
  if (!body) return 0;
  let count = 0;
  body.querySelectorAll('tr').forEach((tr) => {
    // The empty-state row has a single cell with a colSpan attribute; skip it.
    const firstCell = tr.querySelector('td');
    if (firstCell && firstCell.getAttribute('colspan')) return;
    count += 1;
  });
  return count;
}

/** The pagination control: [first][prev]<span>N / M</span>[next][last]. */
function paginationButtons(): HTMLButtonElement[] {
  const indicator = screen.getByText(/\d+ \/ \d+/);
  const container = indicator.parentElement!;
  return Array.from(container.querySelectorAll('button'));
}

describe('DataTable — filtering', () => {
  it('narrows rows when typing in the search box', async () => {
    const user = userEvent.setup();
    renderTable();

    const search = screen.getByPlaceholderText('Search…');
    // "A0" appears only in "Item A0 0" (i=0); other rows use B1, C2, … or A26.
    await user.type(search, 'A0');

    expect(dataRowCount()).toBe(1);
  });

  it('shows all rows again when the search is cleared', async () => {
    const user = userEvent.setup();
    renderTable({ pageSize: 25 });

    const search = screen.getByPlaceholderText('Search…');
    await user.type(search, 'A0');
    expect(dataRowCount()).toBe(1);

    await user.clear(search);
    expect(dataRowCount()).toBe(25);
  });
});

describe('DataTable — sorting', () => {
  it('toggles sort order on a sortable column header', async () => {
    const user = userEvent.setup();
    renderTable({ data: DATA.slice(0, 5), pageSize: 5 });

    const nameHeader = screen.getByRole('button', { name: /^Name/ });
    // First click -> ascending.
    await user.click(nameHeader);
    const namesAsc = readColumnText(0, 5);
    expect(namesAsc).toEqual([...namesAsc].sort());

    // Second click -> descending.
    await user.click(nameHeader);
    const namesDesc = readColumnText(0, 5);
    expect(namesDesc).toEqual([...namesDesc].sort().reverse());
  });

  it('sorts numerically by the score column', async () => {
    const user = userEvent.setup();
    renderTable({ data: DATA.slice(0, 10), pageSize: 10 });

    await user.click(screen.getByRole('button', { name: /^Score/ }));
    const scoresAsc = readColumnText(1, 10).map(Number);
    expect(scoresAsc).toEqual([...scoresAsc].sort((a, b) => a - b));
  });
});

describe('DataTable — pagination', () => {
  it('renders 10 rows on the first page and paginates forward', async () => {
    const user = userEvent.setup();
    renderTable(); // 25 items, pageSize 10 -> 3 pages

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(dataRowCount()).toBe(10);

    // [first][prev]<span>[next][last] — next is index 2.
    const next = paginationButtons()[2]!;
    await user.click(next);

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(dataRowCount()).toBe(10);
  });

  it('disables prev/next buttons at the bounds', () => {
    renderTable(); // 25 items -> 3 pages
    // [first, prev, next, last] — the page indicator is a span, not a button.
    const [first, prev, next, last] = paginationButtons();
    // On page 1: first + prev disabled, next + last enabled.
    expect(first).toBeDisabled();
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();
    expect(last).not.toBeDisabled();
  });

  it('jumps to the last page and shows the remainder', async () => {
    const user = userEvent.setup();
    renderTable(); // 25 items, pageSize 10 -> last page has 5

    // [first, prev, next, last] — last is index 3 (the indicator is a span).
    const last = paginationButtons()[3]!;
    await user.click(last);

    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(dataRowCount()).toBe(5);
  });
});

/** Read the text of column index `col` (0-based) for `count` body rows. */
function readColumnText(col: number, count: number): string[] {
  const body = document.querySelector('tbody')!;
  const rows = Array.from(body.querySelectorAll('tr')).filter(
    (tr) => !tr.querySelector('td')?.getAttribute('colspan'),
  );
  return rows.slice(0, count).map((tr) => {
    const cells = within(tr).getAllByRole('cell');
    return cells[col]?.textContent?.trim() ?? '';
  });
}
