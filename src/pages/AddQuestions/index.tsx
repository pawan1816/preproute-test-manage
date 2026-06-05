import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTestById, bulkCreateQuestions, fetchBulkQuestions, getSubjects, getTopicsBySubject, getSubTopicsByMultiTopics, updateTest } from '../../api/endpoints';
import AppLayout from '../../components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Test, QuestionFormData, Subject, Topic, SubTopic } from '../../types';

interface LocalQuestion extends QuestionFormData {
  _localId?: string;
}

export default function AddQuestions() {
  const navigate = useNavigate();
  const { id: testId } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);

  const [form, setForm] = useState({
    question: '',
    option1: '', option2: '', option3: '', option4: '',
    correct_option: 'option1',
    explanation: '',
    difficulty: '',
    topic: '',
    sub_topic: '',
  });

  useEffect(() => {
    if (testId) {
      loadTestData(testId);
    }
  }, [testId]);

  // When topic changes, load sub-topics
  useEffect(() => {
    if (form.topic) {
      loadSubTopics([form.topic]);
    } else {
      setSubTopics([]);
      setForm((prev) => ({ ...prev, sub_topic: '' }));
    }
  }, [form.topic]);

  const loadTestData = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getTestById(id);
      setTest(data);

      // Resolve subject ID from subject name
      // Backend returns subject: "Physics" (name), not subject_id
      const subjectsData = await getSubjects();
      const subjectName = typeof data.subject === 'string' ? data.subject : '';
      const resolvedSubjectId = data.subject_id || subjectsData.find((s: Subject) => s.name === subjectName)?.id || '';
      setSubjectId(resolvedSubjectId);

      // Load topics from the resolved subject ID
      if (resolvedSubjectId) {
        try {
          const topicsData = await getTopicsBySubject(resolvedSubjectId);
          setTopics(topicsData);
        } catch { /* topics may fail, non-critical */ }
      }

      // Load existing questions
      if (data.questions && data.questions.length > 0) {
        const fetched = await fetchBulkQuestions(data.questions);
        setQuestions(fetched.map((q) => ({ ...q, type: 'mcq' as const, _localId: 'existing-' + Math.random().toString(36).slice(2) })));
      }
    } catch { toast.error('Failed to load test'); }
    finally { setIsLoading(false); }
  };

  const loadSubTopics = async (topicIds: string[]) => {
    try {
      if (topicIds.length > 0) {
        const data = await getSubTopicsByMultiTopics(topicIds);
        setSubTopics(data);
      }
    } catch { /* non-critical */ }
  };

  const handleAddQuestion = () => {
    if (!form.question.trim()) { toast.error('Question text is required'); return; }
    if (!form.option1.trim() || !form.option2.trim() || !form.option3.trim() || !form.option4.trim()) {
      toast.error('All 4 options are required'); return;
    }
    const newQ: LocalQuestion = {
      _localId: Math.random().toString(36).slice(2),
      type: 'mcq',
      question: form.question,
      option1: form.option1, option2: form.option2, option3: form.option3, option4: form.option4,
      correct_option: form.correct_option,
      explanation: form.explanation || undefined,
      difficulty: (form.difficulty as any) || undefined,
      test_id: testId!,
      subject: subjectId,
      topic: form.topic ? (topics.find((t) => t.id === form.topic)?.name || form.topic) : undefined,
      sub_topic: form.sub_topic ? (subTopics.find((st) => st.id === form.sub_topic)?.name || form.sub_topic) : undefined,
    };
    setQuestions((prev) => [...prev, newQ]);
    setForm({ question: '', option1: '', option2: '', option3: '', option4: '', correct_option: 'option1', explanation: '', difficulty: '', topic: '', sub_topic: '' });
    toast.success('Question added');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Auto-add the current form as a question if it has content
      let allQuestions = [...questions];
      if (form.question.trim()) {
        if (!form.option1.trim() || !form.option2.trim() || !form.option3.trim() || !form.option4.trim()) {
          toast.error('All 4 options are required before proceeding');
          setIsSaving(false);
          return;
        }
        const newQ: LocalQuestion = {
          _localId: Math.random().toString(36).slice(2),
          type: 'mcq',
          question: form.question,
          option1: form.option1, option2: form.option2, option3: form.option3, option4: form.option4,
          correct_option: form.correct_option,
          explanation: form.explanation || undefined,
          difficulty: (form.difficulty as any) || undefined,
          test_id: testId!,
          subject: subjectId,
          topic: form.topic ? (topics.find((t) => t.id === form.topic)?.name || form.topic) : undefined,
          sub_topic: form.sub_topic ? (subTopics.find((st) => st.id === form.sub_topic)?.name || form.sub_topic) : undefined,
        };
        allQuestions = [...allQuestions, newQ];
      }

      if (allQuestions.length === 0) { toast.error('Add at least 1 question'); setIsSaving(false); return; }

      const newQuestions = allQuestions.filter((q) => !q._localId?.startsWith('existing'));
      if (newQuestions.length > 0) {
        await bulkCreateQuestions(newQuestions.map(({ _localId, ...q }) => q as QuestionFormData));
      }
      if (testId) {
        await updateTest(testId, { total_questions: allQuestions.length });
      }
      toast.success('Questions saved!');
      navigate(`/tests/${testId}/preview`);
    } catch { toast.error('Failed to save questions'); }
    finally { setIsSaving(false); }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionKeys = ['option1', 'option2', 'option3', 'option4'] as const;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-[#5B7CFF]" />
          <span className="ml-2 text-[13px] text-[#888]">Loading...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-[900px] mx-auto">
          {/* Top Bar with Breadcrumb + Publish */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
              <span className="text-[#666666] cursor-pointer hover:text-[#5B7CFF]" onClick={() => navigate('/dashboard')}>Test Creation</span>
              <span className="text-[#666666]">/</span>
              <span className="text-[#666666]">Create Test</span>
              <span className="text-[#666666]">/</span>
              <span className="text-[#5B7CFF]">Chapter Wise</span>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving || questions.length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: '#5B7CFF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSaving || questions.length === 0 ? 'not-allowed' : 'pointer',
                opacity: isSaving || questions.length === 0 ? 0.5 : 1,
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Publish
            </button>
          </div>

          {/* Main Form Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '24px' }}>
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#333333', fontFamily: 'Inter, sans-serif' }}>
                Question {questions.length + 1}/{test?.total_questions || 50}
              </span>
            </div>

            {/* Text Editor Toolbar */}
            <div
              className="flex items-center gap-0.5 mb-2"
              style={{
                backgroundColor: '#F5F5F5',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                padding: '4px 6px',
              }}
            >
              {['B', 'I', 'U', 'S', '—', '≡', '🔗'].map((icon, i) => (
                <button
                  key={i}
                  type="button"
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#333333',
                    fontFamily: icon === 'B' ? 'Inter, sans-serif' : icon === 'I' ? 'Inter, sans-serif' : 'inherit',
                    fontWeight: icon === 'B' ? 700 : icon === 'I' ? 400 : 400,
                    fontStyle: icon === 'I' ? 'italic' : 'normal',
                    textDecoration: icon === 'U' ? 'underline' : icon === 'S' ? 'line-through' : 'none',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Question Text Area */}
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter question text"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#333333',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                resize: 'none',
                boxSizing: 'border-box',
                marginBottom: '16px',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#5B7CFF'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
            />

            {/* Options Label */}
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333333', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
              Type the options below
            </label>

            {/* Options A/B/C/D */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {optionKeys.map((key, idx) => (
                <div key={key} className="flex items-center" style={{ gap: '8px' }}>
                  {/* Radio Button */}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correct_option: key })}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: form.correct_option === key ? 'none' : '2px solid #999999',
                      backgroundColor: form.correct_option === key ? '#5B7CFF' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    {form.correct_option === key && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                    )}
                  </button>
                  {/* Letter Label */}
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#333333', fontFamily: 'Inter, sans-serif', width: '16px', flexShrink: 0 }}>
                    {optionLabels[idx]}
                  </span>
                  {/* Input */}
                  <input
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={`Type option ${optionLabels[idx]}`}
                    style={{
                      flex: 1,
                      height: '36px',
                      padding: '0 12px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#333333',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#5B7CFF'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
                  />
                </div>
              ))}
            </div>

            {/* Add Solution */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333333', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
                Add Solution
              </label>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="Type here"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#333333',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#5B7CFF'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
              />
            </div>

            {/* Question Settings - 3 Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 400, color: '#666666', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                  Level of Difficulty
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: form.difficulty ? '#333333' : '#999999',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 400, color: '#666666', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                  Topic
                </label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: form.topic ? '#333333' : '#999999',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Topic</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 400, color: '#666666', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                  Sub-topic
                </label>
                <select
                  value={form.sub_topic}
                  onChange={(e) => setForm({ ...form, sub_topic: e.target.value })}
                  disabled={!form.topic}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: form.sub_topic ? '#333333' : '#999999',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    backgroundColor: (!form.topic) ? '#F9FAFB' : '#FFFFFF',
                    cursor: form.topic ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="">Select Sub-topic</option>
                  {subTopics.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddQuestion}
                style={{
                  padding: '8px 20px',
                  backgroundColor: 'transparent',
                  color: '#5B7CFF',
                  border: '2px dashed #5B7CFF',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                + Add Another Question
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#5B7CFF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.5 : 1,
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '100px',
                  justifyContent: 'center',
                }}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Next
              </button>
            </div>
          </div>

          {/* Questions Added List */}
          {questions.length > 0 && (
            <div style={{ marginTop: '16px', background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#333333', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
                Questions Added ({questions.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {questions.map((q, idx) => (
                  <div
                    key={q._localId || idx}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #F0F0F0',
                      borderRadius: '6px',
                      backgroundColor: '#FAFAFA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#5B7CFF', fontFamily: 'Inter, sans-serif' }}>Q{idx + 1}</span>
                      <span style={{ fontSize: '12px', color: '#555555', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                        {q.question}
                      </span>
                    </div>
                    <button
                      onClick={() => q._localId && setQuestions((prev) => prev.filter((item) => item._localId !== q._localId))}
                      style={{ color: '#999999', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: '4px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}