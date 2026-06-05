import { describe, it, expect } from 'vitest';
import type {
  TestFormData,
  QuestionFormData,
  TestStatus,
  TestDifficulty,
  TestType,
} from '../types';

describe('Type System', () => {
  it('TestStatus accepts valid values', () => {
    const statuses: TestStatus[] = ['draft', 'live', 'completed', 'archived'];
    expect(statuses).toHaveLength(4);
  });

  it('TestDifficulty accepts valid values', () => {
    const difficulties: TestDifficulty[] = ['easy', 'medium', 'difficult'];
    expect(difficulties).toHaveLength(3);
  });

  it('TestType accepts valid values', () => {
    const types: TestType[] = ['chapterwise', 'pyq', 'mock'];
    expect(types).toHaveLength(3);
  });

  it('TestFormData has all required fields', () => {
    const formData: TestFormData = {
      name: 'Test',
      type: 'chapterwise',
      subject: 'uuid',
      topics: ['uuid1'],
      sub_topics: [],
      correct_marks: 4,
      wrong_marks: -1,
      unattempt_marks: 0,
      difficulty: 'medium',
      total_time: 60,
      total_marks: 200,
      total_questions: 50,
    };
    expect(formData.name).toBe('Test');
    expect(formData.correct_marks).toBe(4);
  });

  it('QuestionFormData has all required fields', () => {
    const question: QuestionFormData = {
      type: 'mcq',
      question: 'What is 2+2?',
      option1: '3',
      option2: '4',
      option3: '5',
      option4: '6',
      correct_option: 'option2',
      test_id: 'test-uuid',
    };
    expect(question.type).toBe('mcq');
    expect(question.correct_option).toBe('option2');
  });

  it('Test interface works with optional fields', () => {
    const test: { id: string; name: string; status: string; created_at: string; questions?: string[] } = {
      id: 'uuid',
      name: 'Sample Test',
      status: 'draft',
      created_at: '2025-01-01T00:00:00Z',
    };
    expect(test.id).toBe('uuid');
    expect(test.questions).toBeUndefined();
  });
});