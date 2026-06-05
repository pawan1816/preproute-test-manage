import api from './axios';
import type {
  LoginRequest,
  LoginResponse,
  Subject,
  Topic,
  SubTopic,
  TestFormData,
  Test,
  QuestionFormData,
  Question,
} from '../types';

// Generic API response shape (backend returns { status, message, data })
interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

// Auth
export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Subjects
export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get<ApiResponse<Subject[]>>('/subjects');
  return response.data.data;
};

// Topics
export const getTopicsBySubject = async (subjectId: string): Promise<Topic[]> => {
  const response = await api.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`);
  return response.data.data;
};

// Sub-topics
export const getSubTopicsByTopic = async (topicId: string): Promise<SubTopic[]> => {
  const response = await api.get<ApiResponse<SubTopic[]>>(`/sub-topics/topic/${topicId}`);
  return response.data.data;
};

export const getSubTopicsByMultiTopics = async (topicIds: string[]): Promise<SubTopic[]> => {
  const response = await api.post<ApiResponse<SubTopic[]>>('/sub-topics/multi-topics', { topicIds });
  return response.data.data;
};

// Tests
export const getAllTests = async (): Promise<Test[]> => {
  const response = await api.get<ApiResponse<Test[]>>('/tests');
  return response.data.data;
};

export const createTest = async (data: Partial<TestFormData>): Promise<{ data: Test; message?: string }> => {
  const response = await api.post<ApiResponse<Test>>('/tests', data);
  return { data: response.data.data, message: response.data.message };
};

export const updateTest = async (id: string, data: Record<string, unknown>): Promise<{ data: Test; message?: string }> => {
  const response = await api.put<ApiResponse<Test>>(`/tests/${id}`, data);
  return { data: response.data.data, message: response.data.message };
};

export const getTestById = async (id: string): Promise<Test> => {
  const response = await api.get<ApiResponse<Test>>(`/tests/${id}`);
  return response.data.data;
};

export const deleteTest = async (id: string): Promise<void> => {
  await api.delete(`/tests/${id}`);
};

// Questions
export const bulkCreateQuestions = async (questions: QuestionFormData[]): Promise<{ data: Question[]; message: string }> => {
  const response = await api.post<ApiResponse<Question[]>>('/questions/bulk', { questions });
  return { data: response.data.data, message: response.data.message || '' };
};

export const fetchBulkQuestions = async (questionIds: string[]): Promise<Question[]> => {
  const response = await api.post<ApiResponse<Question[]>>('/questions/fetchBulk', { question_ids: questionIds });
  return response.data.data;
};