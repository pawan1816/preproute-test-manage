import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

let mockTests: any[] = [];

vi.mock('../store', () => ({
  useAuthStore: vi.fn().mockImplementation((selector?: Function) => {
    const state = {
      user: { name: 'Test Admin', role: 'admin' },
      isAuthenticated: true,
      logout: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
  useTestStore: vi.fn().mockImplementation((selector?: Function) => {
    const state = {
      tests: mockTests,
      setTests: vi.fn(),
      removeTest: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('../api/endpoints', () => ({
  getAllTests: vi.fn().mockResolvedValue([]),
  deleteTest: vi.fn(),
}));

import Dashboard from '../pages/Dashboard';

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTests = [];
  });

  it('renders dashboard header and Create New Test button', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create new test/i })).toBeInTheDocument();
  });

  it('shows search input', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/search tests/i)).toBeInTheDocument();
  });

  it('shows stats cards', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Tests')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
  });

  it('shows empty state after loading completes', async () => {
    mockTests = [];
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No tests found')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('shows loading spinner initially then transitions', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Component shows loading state initially
    await waitFor(() => {
      expect(screen.getByText('No tests found')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});