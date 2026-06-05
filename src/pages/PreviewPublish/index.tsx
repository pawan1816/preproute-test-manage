import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTestById, updateTest, getSubjects, getTopicsBySubject, getSubTopicsByMultiTopics, fetchBulkQuestions } from '../../api/endpoints';
import AppLayout from '../../components/layout/AppLayout';
import { Edit3, CheckCircle, Loader2, X, Calendar, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Test, Subject, Topic, SubTopic } from '../../types';

type DurationOption = 'always' | '1week' | '2weeks' | '3weeks' | '1month' | 'custom';

export default function PreviewPublish() {
  const navigate = useNavigate();
  const { id: testId } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Resolved names for display
  const [subjectName, setSubjectName] = useState('');
  const [topicNames, setTopicNames] = useState<string[]>([]);
  const [subTopicNames, setSubTopicNames] = useState<string[]>([]);

  // Question list for sidebar
  const [questionCount, setQuestionCount] = useState(0);

  // Helper to normalize topic/sub_topic values to string arrays
  const normalizeToStringArray = (val: string[] | { id: string; name: string }[] | undefined): string[] => {
    if (!val) return [];
    return val.map((item: string | { id: string; name: string }) => typeof item === 'string' ? item : item.name || '');
  };

  // Live duration settings
  const [durationOption, setDurationOption] = useState<DurationOption>('custom');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (testId) loadTest(testId);
  }, [testId]);

  const loadTest = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getTestById(id);
      setTest(data);

      // Load question count
      if (data.questions && data.questions.length > 0) {
        setQuestionCount(data.questions.length);
      }
      const totalQ = data.total_questions || data.questions?.length || 0;
      setQuestionCount(totalQ);

      // The backend resolves IDs to names in the test response:
      // subject: "Physics", topics: ["Thermodynamics"], sub_topics: []
      if (typeof data.subject === 'string' && data.subject.length > 0) {
        setSubjectName(data.subject);
      } else if (data.subject_id) {
        // Fallback: fetch subjects to resolve name
        try {
          const subjects = await getSubjects();
          const found = subjects.find((s: Subject) => s.id === data.subject_id);
          if (found) setSubjectName(found.name);
        } catch { /* non-critical */ }
      }

      // Helper: detect if a string is a UUID (contains dashes at positions 8,13,18,23)
      const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

      // Topics — backend may return resolved names or IDs
      const rawTopics = normalizeToStringArray(data.topics as any);
      if (rawTopics.length > 0 && isUUID(rawTopics[0])) {
        // UUIDs — need to resolve to names
        try {
          // Resolve subject_id if missing
          const sid = data.subject_id || (() => {
            // subject is already a name; resolve from subjects list
            return null;
          })();
          if (sid) {
            const allTopics = await getTopicsBySubject(sid);
            const names = rawTopics.map((id) => {
              const found = allTopics.find((t: Topic) => t.id === id);
              return found ? found.name : '';
            }).filter(Boolean);
            setTopicNames(names);
          }
        } catch { /* non-critical */ }
      } else if (rawTopics.length > 0) {
        // Already resolved names
        setTopicNames(rawTopics);
      }

      // Sub-topics — same logic
      const rawSubTopics = normalizeToStringArray(data.sub_topics as any);
      if (rawSubTopics.length > 0 && isUUID(rawSubTopics[0])) {
        try {
          const topicIds = rawTopics.map((t: string) => t);
          if (topicIds.length > 0) {
            const allSubTopics = await getSubTopicsByMultiTopics(topicIds);
            const names = rawSubTopics.map((id) => {
              const found = allSubTopics.find((st: SubTopic) => st.id === id);
              return found ? found.name : '';
            }).filter(Boolean);
            setSubTopicNames(names);
          }
        } catch { /* non-critical */ }
      } else if (rawSubTopics.length > 0) {
        setSubTopicNames(rawSubTopics);
      }
    } catch { toast.error('Failed to load test'); }
    finally { setIsLoading(false); }
  };

  const handlePublish = async () => {
    if (!testId) return;
    setIsPublishing(true);
    try {
      const updateData: Record<string, unknown> = { status: 'live' };
      if (durationOption === 'custom' && endDate) {
        const dateTime = endTime ? `${endDate}T${endTime}` : `${endDate}T23:59:59`;
        updateData.live_until = new Date(dateTime).toISOString();
      } else if (durationOption !== 'custom') {
        const durations: Record<string, number> = {
          'always': 0,
          '1week': 7,
          '2weeks': 14,
          '3weeks': 21,
          '1month': 30,
        };
        updateData.live_duration_days = durations[durationOption];
      }
      await updateTest(testId, updateData);
      setShowPublishModal(false);
      setShowScheduleModal(false);
      setShowSuccessModal(true);
      toast.success('Test published successfully!');
    } catch { toast.error('Failed to publish test'); }
    finally { setIsPublishing(false); }
  };

  const totalQuestions = test?.total_questions || questionCount || 0;
  const allQuestionsDone = totalQuestions > 0;
  const testType = test?.type === 'chapterwise' ? 'Chapter Wise' : test?.type === 'pyq' ? 'PYQ' : 'Mock Test';

  const durationOptions: { key: DurationOption; label: string }[] = [
    { key: 'always', label: 'Always Available' },
    { key: '1week', label: '1 Week' },
    { key: '2weeks', label: '2 Weeks' },
    { key: '3weeks', label: '3 Weeks' },
    { key: '1month', label: '1 Month' },
    { key: 'custom', label: 'Custom Duration' },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#3b82f6' }} />
          <span style={{ marginLeft: '8px', fontSize: '13px', color: '#888888', fontFamily: 'Inter, sans-serif' }}>Loading test preview...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
        {/* Left Sidebar — Question List */}
        <aside style={{
          width: '220px',
          minWidth: '220px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
          overflowY: 'auto',
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            fontFamily: 'Inter, sans-serif',
            marginBottom: '4px',
          }}>
            Question creation
          </h3>
          <span style={{
            fontSize: '12px',
            fontWeight: 400,
            color: '#9CA3AF',
            fontFamily: 'Inter, sans-serif',
            marginBottom: '16px',
          }}>
            Total Questions - {totalQuestions}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Array.from({ length: Math.min(totalQuestions, 6) }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Green check circle */}
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#374151',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {i === 0 ? 'Question x' : i === 1 ? `Question ${i + 1}` : i === 5 ? `Question ${Math.min(totalQuestions, 50)}` : `Question ${i + 1}`}
                  </span>
                </div>
                <ChevronRight style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>

            {/* Header Row */}
            <div className="flex items-center justify-between mb-6">
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', fontFamily: 'Inter, sans-serif' }}>
                Test creation
              </h1>
              <button
                onClick={() => navigate(`/tests/${testId}/questions`)}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  color: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                <Edit3 style={{ width: '14px', height: '14px', color: '#3b82f6' }} />
                Edit
              </button>
            </div>

            {/* Status Badge — fully rounded pill */}
            <div className="flex items-center gap-3 mb-5">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '999px',
                backgroundColor: '#ECFDF5',
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#065F46', fontFamily: 'Inter, sans-serif' }}>
                  Test created
                </span>
                {allQuestionsDone && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#FFFFFF',
                    backgroundColor: '#10B981',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    All {totalQuestions} Questions done
                  </span>
                )}
              </div>
            </div>

            {/* Chapter Card */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              {/* Chapter Wise Badge + Edit */}
              <div className="flex items-center justify-between mb-4">
                <span style={{
                  padding: '4px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  backgroundColor: '#1e293b',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {testType}
                </span>
                <button
                  onClick={() => navigate(`/tests/${testId}/edit`)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Edit3 style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                </button>
              </div>

              {/* Chapter Info Row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827', fontFamily: 'Inter, sans-serif' }}>
                      Chapter 1
                    </span>
                    {test?.difficulty && (
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#FFFFFF',
                        backgroundColor: '#14b8a6',
                        fontFamily: 'Inter, sans-serif',
                        textTransform: 'capitalize',
                      }}>
                        {test.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ color: '#374151' }}>Subject:</span>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      backgroundColor: '#f3f4f6',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {subjectName || (test?.subject as string) || '—'}
                    </span>
                  </div>

                  {/* Topics */}
                  {topicNames.length > 0 && (
                    <div className="flex items-center gap-2 mb-2" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                      <span style={{ color: '#374151' }}>Topic:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {topicNames.map((name, i) => (
                          <span key={i} style={{
                            padding: '2px 10px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#d97706',
                            backgroundColor: '#fef3c7',
                            fontFamily: 'Inter, sans-serif',
                          }}>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub Topics */}
                  {subTopicNames.length > 0 && (
                    <div className="flex items-center gap-2" style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                      <span style={{ color: '#374151' }}>Sub Topic:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {subTopicNames.map((name, i) => (
                          <span key={i} style={{
                            padding: '2px 10px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#d97706',
                            backgroundColor: '#fef3c7',
                            fontFamily: 'Inter, sans-serif',
                          }}>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-5">
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      {test?.total_time || 0} Min
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      {totalQuestions} Qs
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      {test?.total_marks || 0} Marks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Publish Options */}
            {test?.status !== 'live' && (
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setShowPublishModal(true)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#3b82f6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Publish Now
                </button>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Schedule Publish
                </button>
              </div>
            )}

            {/* Live Duration Section */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                Live Until
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
                Choose how long this test should remain available on the platform.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {durationOptions.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setDurationOption(opt.key)}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: durationOption === opt.key ? 'none' : '2px solid #D1D5DB',
                      backgroundColor: durationOption === opt.key ? '#3b82f6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {durationOption === opt.key && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '14px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Custom Duration Date/Time Pickers */}
              {durationOption === 'custom' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                      Select End Date
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 36px 0 12px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: endDate ? '#374151' : '#9CA3AF',
                          fontFamily: 'Inter, sans-serif',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
                      />
                      <Calendar style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: '#9CA3AF',
                        pointerEvents: 'none',
                      }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                      Select End Time
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 36px 0 12px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: endTime ? '#374151' : '#9CA3AF',
                          fontFamily: 'Inter, sans-serif',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
                      />
                      <Clock style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: '#9CA3AF',
                        pointerEvents: 'none',
                      }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={isPublishing}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#3b82f6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isPublishing ? 0.5 : 1,
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isPublishing && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '24px', width: '400px', maxWidth: '90vw' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', fontFamily: 'Inter, sans-serif' }}>Confirm Publish</h3>
              <button onClick={() => setShowPublishModal(false)} style={{ color: '#9CA3AF', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>
              Are you sure you want to publish <strong>{test?.name}</strong>? Once published, it will be visible to all users.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: '#374151',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: '#FFFFFF',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isPublishing ? 0.5 : 1,
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isPublishing && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Publish Modal */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '24px', width: '440px', maxWidth: '90vw' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', fontFamily: 'Inter, sans-serif' }}>Schedule Publish</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ color: '#9CA3AF', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
              Set a date and time to auto-publish <strong>{test?.name}</strong>.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                  Publish Date
                </label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                  Publish Time
                </label>
                <input
                  type="time"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: '#374151',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: '#FFFFFF',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isPublishing ? 0.5 : 1,
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isPublishing && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '32px', width: '400px', maxWidth: '90vw', textAlign: 'center' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ECFDF5' }}>
              <CheckCircle style={{ width: '32px', height: '32px', color: '#10B981' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>Published!</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', fontFamily: 'Inter, sans-serif' }}>Your test has been published successfully.</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#3b82f6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}