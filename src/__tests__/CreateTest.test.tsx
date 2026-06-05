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
  useTestStore: createMockStore({ setCurrentTest: vi.fn() }),
  useAuthStore: createMockStore({ user: { name: 'Admin' } }),
}));

vi.mock('../api/endpoints', () => ({
  getSubjects: vi.fn().mockResolvedValue([
    { id: 'sub-1', name: 'Mathematics' },
    { id: 'sub-2', name: 'Physics' },
  ]),
  getTopicsBySubject: vi.fn().mockResolvedValue([]),
  getSubTopicsByMultiTopics: vi.fn().mockResolvedValue([]),
  createTest: vi.fn(),
  updateTest: vi.fn(),
  getTestById: vi.fn(),
}));

import CreateTest from '../pages/CreateTest';
import { getSubjects } from '../api/endpoints';

describe('Create Test Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create test page with breadcrumb and sidebar', async () => {
    render(
      <BrowserRouter>
        <CreateTest />
      </BrowserRouter>
    );

    // Sidebar nav shows "Test Creation" (appears multiple times - sidebar + breadcrumb)
    expect(screen.getAllByText('Test Creation').length).toBeGreaterThanOrEqual(1);
    // Breadcrumb shows "Create Test"
    expect(screen.getByText('Create Test')).toBeInTheDocument();
  });

  it('renders form field labels', async () => {
    render(
      <BrowserRouter>
        <CreateTest />
      </BrowserRouter>
    );

    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Name of Test')).toBeInTheDocument();
    expect(screen.getByText(/Duration/i)).toBeInTheDocument();
  });

  it('renders action buttons', async () => {
    render(
      <BrowserRouter>
        <CreateTest />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('renders marking scheme section', () => {
    render(
      <BrowserRouter>
        <CreateTest />
      </BrowserRouter>
    );

    expect(screen.getByText(/Marking Scheme/)).toBeInTheDocument();
  });

  it('calls getSubjects API on mount', () => {
    render(
      <BrowserRouter>
        <CreateTest />
      </BrowserRouter>
    );

    expect(getSubjects).toHaveBeenCalled();
  });

  it('renders no of questions and total marks fields', () => {
    render(
      <BrowserRouter>
        <CreateTest />
      </BrowserRouter>
    );

    expect(screen.getByText('No of Questions')).toBeInTheDocument();
    expect(screen.getByText('Total Marks')).toBeInTheDocument();
  });
});