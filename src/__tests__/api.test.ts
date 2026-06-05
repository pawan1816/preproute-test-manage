import { describe, it, expect, vi } from 'vitest';
import api from '../api/axios';
import {
  loginUser,
  getSubjects,
  getTopicsBySubject,
  getSubTopicsByMultiTopics,
  getAllTests,
  createTest,
  updateTest,
  getTestById,
  deleteTest,
  bulkCreateQuestions,
  fetchBulkQuestions,
} from '../api/endpoints';

// Mock axios
vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth', () => {
    it('loginUser calls POST /auth/login', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { status: 'success', data: { token: 'jwt-token', user: { id: '1' } } },
      });

      const result = await loginUser({ userId: 'test', password: 'pass' });
      expect(api.post).toHaveBeenCalledWith('/auth/login', { userId: 'test', password: 'pass' });
      expect(result.data.token).toBe('jwt-token');
    });
  });

  describe('Subjects', () => {
    it('getSubjects calls GET /subjects', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { data: [{ id: '1', name: 'Math' }] },
      });

      const result = await getSubjects();
      expect(api.get).toHaveBeenCalledWith('/subjects');
      expect(result).toEqual([{ id: '1', name: 'Math' }]);
    });
  });

  describe('Topics', () => {
    it('getTopicsBySubject calls GET /topics/subject/:id', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { data: [{ id: 't1', name: 'Algebra', subject_id: '1' }] },
      });

      const result = await getTopicsBySubject('1');
      expect(api.get).toHaveBeenCalledWith('/topics/subject/1');
      expect(result[0].name).toBe('Algebra');
    });

    it('getSubTopicsByMultiTopics calls POST /sub-topics/multi-topics', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { data: [{ id: 'st1', name: 'Linear', topic_id: 't1' }] },
      });

      const result = await getSubTopicsByMultiTopics(['t1', 't2']);
      expect(api.post).toHaveBeenCalledWith('/sub-topics/multi-topics', { topicIds: ['t1', 't2'] });
      expect(result[0].name).toBe('Linear');
    });
  });

  describe('Tests', () => {
    it('getAllTests calls GET /tests', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { data: [{ id: 'test-1', name: 'Test 1' }] },
      });

      const result = await getAllTests();
      expect(api.get).toHaveBeenCalledWith('/tests');
      expect(result.length).toBe(1);
    });

    it('createTest calls POST /tests', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { data: { id: 'new-test', name: 'New' }, message: 'Created' },
      });

      const result = await createTest({ name: 'New' });
      expect(api.post).toHaveBeenCalledWith('/tests', { name: 'New' });
      expect(result.data.id).toBe('new-test');
    });

    it('updateTest calls PUT /tests/:id', async () => {
      vi.mocked(api.put).mockResolvedValue({
        data: { data: { id: 'test-1', name: 'Updated' } },
      });

      await updateTest('test-1', { name: 'Updated' });
      expect(api.put).toHaveBeenCalledWith('/tests/test-1', { name: 'Updated' });
    });

    it('getTestById calls GET /tests/:id', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { data: { id: 'test-1', name: 'Test' } },
      });

      const result = await getTestById('test-1');
      expect(api.get).toHaveBeenCalledWith('/tests/test-1');
      expect(result.name).toBe('Test');
    });

    it('deleteTest calls DELETE /tests/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: {} });
      await deleteTest('test-1');
      expect(api.delete).toHaveBeenCalledWith('/tests/test-1');
    });
  });

  describe('Questions', () => {
    it('bulkCreateQuestions calls POST /questions/bulk', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { data: [{ id: 'q1' }], message: 'Created 1' },
      });

      const bulkResult = await bulkCreateQuestions([{
        type: 'mcq',
        question: 'What is 2+2?',
        option1: '3', option2: '4', option3: '5', option4: '6',
        correct_option: 'option2',
        test_id: 'test-1',
      }]);

      expect(api.post).toHaveBeenCalledWith('/questions/bulk', {
        questions: [expect.objectContaining({ type: 'mcq', question: 'What is 2+2?' })],
      });
      expect(bulkResult.data.length).toBe(1);
    });

    it('fetchBulkQuestions calls POST /questions/fetchBulk', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { data: [{ id: 'q1', question: 'Q1' }] },
      });

      const result = await fetchBulkQuestions(['q1']);
      expect(api.post).toHaveBeenCalledWith('/questions/fetchBulk', { question_ids: ['q1'] });
      expect(result.length).toBe(1);
    });
  });
});