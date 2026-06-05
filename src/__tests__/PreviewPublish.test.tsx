import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function createMockStore(state: Record<string, unknown>) {
  return vi.fn().mockImplementation((selector?: Function) =>
    selector ? selector(state) : state
  );
}

vi.mock('../store', () => ({
  useTestStore: createMockStore({ updateTestInList: vi.fn() }),
  useAuthStore: createMockStore({ user: { name: 'Admin' } }),
}));

vi.mock('../api/endpoints', () => ({
  getTestById: vi.fn().mockResolvedValue({
    id: 'test-1',
    name: 'Sample Test',
    status: 'draft',
    type: 'chapterwise',
    subject: 'Mathematics',
    total_time: 60,
    total_marks: 250,
    total_questions: 50,
    correct_marks: 5,
    wrong_marks: -1,
    unattempt_marks: 0,
    difficulty: 'easy',
    questions: [],
  }),
  updateTest: vi.fn(),
  fetchBulkQuestions: vi.fn().mockResolvedValue([]),
}));

import PreviewPublish from '../pages/PreviewPublish';

describe('Preview & Publish Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <PreviewPublish />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('has correct page structure with sidebar', () => {
    render(
      <BrowserRouter>
        <PreviewPublish />
      </BrowserRouter>
    );

    // Sidebar + header both show "PrepRoute" brand name
    expect(screen.getAllByText('PrepRoute').length).toBeGreaterThanOrEqual(1);
  });
});