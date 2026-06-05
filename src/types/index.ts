// Auth types
export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  status?: string;
  success?: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface User {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

// Subject types
export interface Subject {
  id: string;
  name: string;
}

// Topic types
export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

// Sub-topic types
export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

// Test types
export type TestStatus = 'draft' | 'live' | 'completed' | 'archived';
export type TestDifficulty = 'easy' | 'medium' | 'difficult';
export type TestType = 'chapterwise' | 'pyq' | 'mock';

export interface TestFormData {
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: TestDifficulty;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status?: TestStatus | null;
}

export interface Test {
  id: string;
  name: string;
  type?: TestType;
  subject?: string;
  subject_id?: string;
  topics?: string[] | Topic[];
  sub_topics?: string[] | SubTopic[];
  status: TestStatus;
  created_at: string;
  updated_at?: string;
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  difficulty?: TestDifficulty;
  total_time?: number;
  total_marks?: number;
  total_questions?: number;
  questions?: string[];
}

export interface TestListResponse {
  status: string;
  data: Test[];
}

export interface TestDetailResponse {
  status: string;
  data: Test;
  message?: string;
}

// Question types
export interface QuestionFormData {
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation?: string;
  difficulty?: TestDifficulty;
  test_id: string;
  subject?: string;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
}

export interface Question {
  id: string;
  type: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation?: string;
  difficulty?: TestDifficulty;
  test_id: string;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
}

export interface BulkQuestionResponse {
  status: string;
  data: Question[];
  message: string;
}

export interface FetchBulkQuestionsResponse {
  status: string;
  data: Question[];
}

// API generic response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}