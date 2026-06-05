import { create } from 'zustand';
import type { Test } from '../types';

interface TestState {
  tests: Test[];
  currentTest: Test | null;
  isLoading: boolean;
  error: string | null;
  setTests: (tests: Test[]) => void;
  setCurrentTest: (test: Test | null) => void;
  addTest: (test: Test) => void;
  updateTestInList: (id: string, test: Partial<Test>) => void;
  removeTest: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTestStore = create<TestState>((set) => ({
  tests: [],
  currentTest: null,
  isLoading: false,
  error: null,

  setTests: (tests) => set({ tests }),
  setCurrentTest: (test) => set({ currentTest: test }),

  addTest: (test) =>
    set((state) => ({ tests: [test, ...state.tests] })),

  updateTestInList: (id, updatedFields) =>
    set((state) => ({
      tests: state.tests.map((t) =>
        t.id === id ? { ...t, ...updatedFields } : t
      ),
      currentTest:
        state.currentTest?.id === id
          ? { ...state.currentTest, ...updatedFields }
          : state.currentTest,
    })),

  removeTest: (id) =>
    set((state) => ({
      tests: state.tests.filter((t) => t.id !== id),
      currentTest: state.currentTest?.id === id ? null : state.currentTest,
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));