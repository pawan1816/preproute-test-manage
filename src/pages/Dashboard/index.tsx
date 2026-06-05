import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTests, deleteTest } from '../../api/endpoints';
import { useTestStore, useAuthStore } from '../../store';
import type { Test } from '../../types';
import AppLayout from '../../components/layout/AppLayout';
import { Plus, Edit3, Eye, Trash2, Search, BookOpen, Clock, Award, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tests, setTests, removeTest } = useTestStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTests();
      setTests(data);
    } catch {
      toast.error('Failed to fetch tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      setDeletingId(id);
      await deleteTest(id);
      removeTest(id);
      toast.success('Test deleted successfully');
    } catch {
      toast.error('Failed to delete test');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      draft: { bg: '#FFF3E0', text: '#E65100' },
      live: { bg: '#E8F5E9', text: '#2E7D32' },
      completed: { bg: '#E3F2FD', text: '#1565C0' },
      archived: { bg: '#F3E5F5', text: '#6A1B9A' },
    };
    const s = styles[status] || { bg: '#F5F5F5', text: '#666666' };
    return (
      <span style={{
        padding: '3px 12px',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: 500,
        backgroundColor: s.bg,
        color: s.text,
        fontFamily: 'Inter, sans-serif',
      }}>
        {status === 'live' ? 'Published' : status?.charAt(0).toUpperCase() + status?.slice(1) || 'Draft'}
      </span>
    );
  };

  const filteredTests = tests.filter((test: Test) => {
    const matchesSearch =
      test.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.subject?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#333333', fontFamily: 'Inter, sans-serif' }}>Test Dashboard</h1>
            <p style={{ fontSize: '13px', color: '#888888', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>Welcome back, {user?.name || 'Admin'}</p>
          </div>
          <button
            onClick={() => navigate('/tests/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#5B7CFF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Plus className="w-4 h-4" />
            Create New Test
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tests', value: tests.length, icon: BookOpen, bg: '#EBF5FB', color: '#2E86C1' },
            { label: 'Published', value: tests.filter((t: Test) => t.status === 'live').length, icon: Eye, bg: '#E8F8F5', color: '#1ABC9C' },
            { label: 'Drafts', value: tests.filter((t: Test) => t.status === 'draft').length, icon: Edit3, bg: '#FEF9E7', color: '#F39C12' },
            { label: 'Total Questions', value: tests.reduce((acc: number, t: Test) => acc + (t.total_questions || 0), 0), icon: Award, bg: '#F5EEF8', color: '#8E44AD' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '16px' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: '12px', color: '#888888', fontFamily: 'Inter, sans-serif' }}>{stat.label}</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#333333', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999999' }} />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '16px',
                paddingTop: '10px',
                paddingBottom: '10px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                color: '#333333',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#555555',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="live">Published</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Tests Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', overflow: 'hidden' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5B7CFF' }} />
              <span style={{ marginLeft: '8px', fontSize: '13px', color: '#888888', fontFamily: 'Inter, sans-serif' }}>Loading tests...</span>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: '#999999' }}>
              <BookOpen className="w-12 h-12 mb-3" />
              <p style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>No tests found</p>
              <p style={{ fontSize: '12px', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>Create your first test to get started</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '1px solid #E0E0E0' }}>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Test Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Subject</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Questions</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Duration</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Created</th>
                  <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '11px', fontWeight: 600, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test: Test) => (
                  <tr key={test.id} style={{ borderBottom: '1px solid #F0F0F0', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAFAFA'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#333333', fontFamily: 'Inter, sans-serif' }}>{test.name}</div>
                      {test.difficulty && (
                        <span style={{
                          fontSize: '10px',
                          marginTop: '2px',
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          backgroundColor: test.difficulty === 'easy' ? '#E8F5E9' : test.difficulty === 'medium' ? '#FFF3E0' : '#FFEBEE',
                          color: test.difficulty === 'easy' ? '#2E7D32' : test.difficulty === 'medium' ? '#E65100' : '#C62828',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {test.difficulty}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555555', fontFamily: 'Inter, sans-serif' }}>
                      {typeof test.subject === 'string' ? test.subject : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>{getStatusBadge(test.status)}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555555', fontFamily: 'Inter, sans-serif' }}>{test.total_questions || test.questions?.length || 0}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#555555', fontFamily: 'Inter, sans-serif' }}>
                      {test.total_time ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" style={{ color: '#999999' }} />
                          {test.total_time} min
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: '#888888', fontFamily: 'Inter, sans-serif' }}>
                      {test.created_at ? new Date(test.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/tests/${test.id}/preview`)}
                          style={{ padding: '6px', color: '#999999', backgroundColor: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/tests/${test.id}/edit`)}
                          style={{ padding: '6px', color: '#999999', backgroundColor: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          disabled={deletingId === test.id}
                          style={{ padding: '6px', color: '#999999', backgroundColor: 'transparent', border: 'none', borderRadius: '4px', cursor: deletingId === test.id ? 'not-allowed' : 'pointer', opacity: deletingId === test.id ? 0.5 : 1 }}
                          title="Delete"
                        >
                          {deletingId === test.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}