import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = vi.fn();
const mockClearError = vi.fn();

vi.mock('../store', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      login: mockLogin,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      clearError: mockClearError,
    };
    return selector ? selector(state) : state;
  }),
}));

import Login from '../pages/Login';

const renderLogin = () =>
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with userId and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/user id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('renders Preproute branding', () => {
    renderLogin();
    expect(screen.getByAltText('Preproute')).toBeInTheDocument();
    expect(screen.getByText('Preproute')).toBeInTheDocument();
    // "Login" appears as heading and button
    const loginTexts = screen.getAllByText('Login');
    expect(loginTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('disables submit button when fields are empty', () => {
    renderLogin();
    const submitBtn = screen.getByRole('button', { name: /^login$/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button when both fields have values', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/user id/i), 'test-user');
    await user.type(screen.getByLabelText(/password/i), 'test-pass');

    const submitBtn = screen.getByRole('button', { name: /^login$/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls login on form submit with credentials', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/user id/i), 'vedant-admin');
    await user.type(screen.getByLabelText(/password/i), 'vedant123');
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    expect(mockLogin).toHaveBeenCalledWith('vedant-admin', 'vedant123');
  });
});