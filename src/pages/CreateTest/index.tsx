import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSubjects, getTopicsBySubject, getSubTopicsByMultiTopics, createTest, updateTest, getTestById } from '../../api/endpoints';
import AppLayout from '../../components/layout/AppLayout';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Subject, Topic, SubTopic, TestType, TestDifficulty } from '../../types';

const testSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  type: z.enum(['chapterwise', 'pyq', 'mock']),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'At least one topic is required'),
  sub_topics: z.array(z.string()),
  correct_marks: z.number().min(0),
  wrong_marks: z.number(),
  unattempt_marks: z.number().min(0),
  difficulty: z.enum(['easy', 'medium', 'difficult']),
  total_time: z.number().min(1, 'Duration is required'),
  total_marks: z.number().min(1, 'Total marks is required'),
  total_questions: z.number().min(1, 'Number of questions is required'),
});

type TestFormValues = z.infer<typeof testSchema>;

export default function CreateTest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
      type: 'chapterwise',
      subject: '',
      topics: [],
      sub_topics: [],
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      difficulty: 'easy',
      total_time: 60,
      total_marks: 250,
      total_questions: 50,
    },
  });

  const watchedSubject = watch('subject');
  const watchedTopics = watch('topics');
  const watchedType = watch('type');
  const watchedDifficulty = watch('difficulty');
  const watchedCorrectMarks = watch('correct_marks');
  const watchedWrongMarks = watch('wrong_marks');
  const watchedUnattemptMarks = watch('unattempt_marks');

  useEffect(() => {
    loadSubjects();
    if (isEditing && id) loadTestData(id);
  }, []);

  useEffect(() => {
    if (watchedSubject) {
      loadTopics(watchedSubject);
      setValue('topics', []);
      setValue('sub_topics', []);
      setSubTopics([]);
    }
  }, [watchedSubject]);

  useEffect(() => {
    if (watchedTopics.length > 0) {
      loadSubTopics(watchedTopics);
    } else {
      setSubTopics([]);
    }
  }, [watchedTopics]);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch { toast.error('Failed to load subjects'); }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      const data = await getTopicsBySubject(subjectId);
      setTopics(data);
    } catch { toast.error('Failed to load topics'); }
  };

  const loadSubTopics = async (topicIds: string[]) => {
    try {
      if (topicIds.length > 0) {
        const data = await getSubTopicsByMultiTopics(topicIds);
        setSubTopics(data);
      }
    } catch { toast.error('Failed to load sub-topics'); }
  };

  const loadTestData = async (testId: string) => {
    setIsLoadingData(true);
    try {
      const test = await getTestById(testId);
      setValue('name', test.name || '');
      setValue('type', (test.type as TestType) || 'chapterwise');
      setValue('subject', test.subject_id || '');
      setValue('difficulty', (test.difficulty as TestDifficulty) || 'easy');
      setValue('correct_marks', test.correct_marks ?? 5);
      setValue('wrong_marks', test.wrong_marks ?? -1);
      setValue('unattempt_marks', test.unattempt_marks ?? 0);
      setValue('total_time', test.total_time ?? 60);
      setValue('total_marks', test.total_marks ?? 250);
      setValue('total_questions', test.total_questions ?? 50);
    } catch { toast.error('Failed to load test data'); }
    finally { setIsLoadingData(false); }
  };

  const onSubmit = async (data: TestFormValues, status: 'draft' | null = null) => {
    setIsSaving(true);
    try {
      const payload = { ...data, ...(status ? { status } : {}) };
      if (isEditing && id) {
        await updateTest(id, payload);
        toast.success('Test updated successfully');
      } else {
        const result = await createTest(payload);
        toast.success(result.message || 'Test created successfully');
        if (result.data?.id) {
          navigate(`/tests/${result.data.id}/questions`);
          return;
        }
      }
      navigate('/dashboard');
    } catch {
      toast.error(isEditing ? 'Failed to update test' : 'Failed to create test');
    } finally { setIsSaving(false); }
  };

  const adjustMark = (field: 'correct_marks' | 'wrong_marks' | 'unattempt_marks', delta: number) => {
    const current = watch(field);
    setValue(field, current + delta);
  };

  const typeTabs: { key: TestType; label: string }[] = [
    { key: 'chapterwise', label: 'Chapter Wise' },
    { key: 'pyq', label: 'PYQ' },
    { key: 'mock', label: 'Mock Test' },
  ];

  const inputStyle = (hasError: boolean = false): React.CSSProperties => ({
    width: '100%',
    height: '40px',
    padding: '0 12px',
    border: `1px solid ${hasError ? '#EF4444' : '#E0E0E0'}`,
    borderRadius: '4px',
    fontSize: '14px',
    color: '#333333',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box' as const,
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 400,
    color: '#666666',
    marginBottom: '6px',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-[820px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-5" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
            <span className="text-[#666666] cursor-pointer hover:text-[#5B7CFF]" onClick={() => navigate('/dashboard')}>Test Creation</span>
            <span className="text-[#666666]">/</span>
            <span className="text-[#666666]">{isEditing ? 'Edit Test' : 'Create Test'}</span>
            <span className="text-[#666666]">/</span>
            <span className="text-[#5B7CFF]">
              {watchedType === 'chapterwise' ? 'Chapter Wise' : watchedType === 'pyq' ? 'PYQ' : 'Mock Test'}
            </span>
          </div>

          {/* Form Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '24px' }}>
            {/* Type Tabs */}
            <div className="flex" style={{ borderBottom: '1px solid #E0E0E0', marginBottom: '24px' }}>
              {typeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setValue('type', tab.key)}
                  style={{
                    paddingBottom: '12px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontSize: '14px',
                    fontWeight: watchedType === tab.key ? 600 : 400,
                    color: watchedType === tab.key ? '#333333' : '#666666',
                    fontFamily: 'Inter, sans-serif',
                    border: 'none',
                    borderBottom: watchedType === tab.key ? '2px solid #5B7CFF' : '2px solid transparent',
                    marginBottom: '-1px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Grid - 2 columns */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {/* Subject */}
              <div>
                <label style={labelStyle}>
                  Subject <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  {...register('subject')}
                  style={{
                    ...inputStyle(!!errors.subject),
                    cursor: 'pointer',
                    paddingRight: '32px',
                  }}
                >
                  <option value="">Choose from Drop-down</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.subject && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>{errors.subject.message}</p>}
              </div>

              {/* Name of Test */}
              <div>
                <label style={labelStyle}>
                  Name of Test <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  {...register('name')}
                  placeholder="Enter name of Test"
                  style={inputStyle(!!errors.name)}
                  onFocus={(e) => { e.target.style.borderColor = '#5B7CFF'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
                />
                {errors.name && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>{errors.name.message}</p>}
              </div>

              {/* Topic */}
              <div>
                <label style={labelStyle}>
                  Topic <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Controller
                  name="topics"
                  control={control}
                  render={({ field }) => (
                    <select
                      multiple
                      value={field.value}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, (o) => o.value);
                        field.onChange(values);
                      }}
                      disabled={!watchedSubject}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px 12px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#333333',
                        outline: 'none',
                        backgroundColor: watchedSubject ? '#FFFFFF' : '#F9FAFB',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                />
                {!watchedSubject && <p style={{ fontSize: '12px', color: '#999999', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>Select a subject first</p>}
              </div>

              {/* Sub Topic */}
              <div>
                <label style={labelStyle}>Sub Topic</label>
                <Controller
                  name="sub_topics"
                  control={control}
                  render={({ field }) => (
                    <select
                      multiple
                      value={field.value}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, (o) => o.value);
                        field.onChange(values);
                      }}
                      disabled={watchedTopics.length === 0}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px 12px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#333333',
                        outline: 'none',
                        backgroundColor: watchedTopics.length > 0 ? '#FFFFFF' : '#F9FAFB',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {subTopics.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                    </select>
                  )}
                />
              </div>

              {/* Duration */}
              <div>
                <label style={labelStyle}>
                  Duration (Minutes) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  {...register('total_time', { valueAsNumber: true })}
                  placeholder="Enter the time"
                  style={inputStyle()}
                  onFocus={(e) => { e.target.style.borderColor = '#5B7CFF'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
                />
              </div>

              {/* Difficulty */}
              <div>
                <label style={labelStyle}>Test Difficulty Level</label>
                <div className="flex items-center gap-6" style={{ marginTop: '10px' }}>
                  {(['easy', 'medium', 'difficult'] as const).map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setValue('difficulty', level)}
                        className="flex items-center justify-center cursor-pointer"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: watchedDifficulty === level ? 'none' : '2px solid #E0E0E0',
                          backgroundColor: watchedDifficulty === level ? '#5B7CFF' : 'transparent',
                        }}
                      >
                        {watchedDifficulty === level && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                        )}
                      </div>
                      <span style={{ fontSize: '14px', color: '#333333', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' as const }}>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Marking Scheme */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333333', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
                  Marking Scheme:
                </label>
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Wrong Answer */}
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '13px', color: '#666666', fontFamily: 'Inter, sans-serif', minWidth: '80px' }}>Wrong Answer</span>
                    <div className="flex items-center" style={{ border: '1px solid #E0E0E0', borderRadius: '4px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => adjustMark('wrong_marks', -1)}
                        style={{ padding: '6px 10px', backgroundColor: '#F5F5F5', border: 'none', cursor: 'pointer', color: '#333333' }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <span style={{ padding: '6px 14px', fontSize: '14px', fontWeight: 500, color: '#333333', minWidth: '36px', textAlign: 'center' as const, backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                        {watchedWrongMarks}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustMark('wrong_marks', 1)}
                        style={{ padding: '6px 10px', backgroundColor: '#F5F5F5', border: 'none', cursor: 'pointer', color: '#333333' }}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Unattempted */}
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '13px', color: '#666666', fontFamily: 'Inter, sans-serif', minWidth: '80px' }}>Unattempted</span>
                    <div className="flex items-center" style={{ border: '1px solid #E0E0E0', borderRadius: '4px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => adjustMark('unattempt_marks', -1)}
                        style={{ padding: '6px 10px', backgroundColor: '#F5F5F5', border: 'none', cursor: 'pointer', color: '#333333' }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <span style={{ padding: '6px 14px', fontSize: '14px', fontWeight: 500, color: '#333333', minWidth: '36px', textAlign: 'center' as const, backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                        +{watchedUnattemptMarks}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustMark('unattempt_marks', 1)}
                        style={{ padding: '6px 10px', backgroundColor: '#F5F5F5', border: 'none', cursor: 'pointer', color: '#333333' }}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '13px', color: '#666666', fontFamily: 'Inter, sans-serif', minWidth: '80px' }}>Correct Answer</span>
                    <div className="flex items-center" style={{ border: '1px solid #E0E0E0', borderRadius: '4px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => adjustMark('correct_marks', -1)}
                        style={{ padding: '6px 10px', backgroundColor: '#F5F5F5', border: 'none', cursor: 'pointer', color: '#333333' }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <span style={{ padding: '6px 14px', fontSize: '14px', fontWeight: 500, color: '#333333', minWidth: '36px', textAlign: 'center' as const, backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                        +{watchedCorrectMarks}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustMark('correct_marks', 1)}
                        style={{ padding: '6px 10px', backgroundColor: '#F5F5F5', border: 'none', cursor: 'pointer', color: '#333333' }}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* No of Questions */}
              <div>
                <label style={labelStyle}>
                  No of Questions <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  {...register('total_questions', { valueAsNumber: true })}
                  placeholder="Ex: 50"
                  style={inputStyle()}
                  onFocus={(e) => { e.target.style.borderColor = '#5B7CFF'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
                />
              </div>

              {/* Total Marks */}
              <div>
                <label style={labelStyle}>
                  Total Marks <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  {...register('total_marks', { valueAsNumber: true })}
                  placeholder="Ex: 250"
                  style={inputStyle()}
                  onFocus={(e) => { e.target.style.borderColor = '#5B7CFF'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-5" style={{ borderTop: '1px solid #E0E0E0' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#FFFFFF',
                  color: '#666666',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data))}
                disabled={isSaving}
                style={{
                  padding: '10px 24px',
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
                  gap: '8px',
                }}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}