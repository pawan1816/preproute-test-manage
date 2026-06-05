# Frontend Developer Task - Test Management Application

## Overview
Build a test management application that allows users to create tests, add questions, and publish them. This is a 5-page flow application focusing on CRUD operations and API integration.

## API Base URL
https://admin-moderator-backend-staging.up.railway.app/api

## Test Credentials
Username: vedant-admin
Password: vedant123

## Authentication
All APIs except login require JWT token in header:
Authorization: Bearer <token>

## API Endpoints
1. POST /auth/login - { userId, password } → { success, data: { token, user } }
2. GET /subjects → { success, data: [{ id, name }] }
3. GET /topics/subject/:subjectId → { success, data: [{ id, name, subject_id }] }
4. GET /sub-topics/topic/:topicId → { success, data: [{ id, name, topic_id }] }
5. GET /tests → { success, data: [{ id, name, subject, topics, status, created_at }] }
6. POST /tests - { name, type, subject, topics, sub_topics, correct_marks, wrong_marks, unattempt_marks, difficulty, total_time, total_marks, total_questions, status }
7. PUT /tests/:id - partial update
8. GET /tests/:id → full test details with questions
9. POST /questions/bulk - { questions: [{ type, question, option1-4, correct_option, explanation, difficulty, test_id }] }
10. PUT /tests/:id - { status: "live" } to publish
11. POST /sub-topics/multi-topics - { topicIds: [...] }
12. POST /questions/fetchBulk - { question_ids: [...] }