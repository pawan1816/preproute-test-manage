import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import loginIllustration from '/public/login-illustration.png';
import preprouteLogo from '/public/preproute-logo.png';

export default function Login() {
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) return;
    await login(userId, password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Illustration */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#F5F7FA' }}
      >
        {/* Decorative dots */}
        <div className="absolute top-[80px] left-[60px] w-[10px] h-[10px] rounded-full" style={{ backgroundColor: '#D5D8DC', opacity: 0.7 }} />
        <div className="absolute top-[160px] right-[90px] w-[14px] h-[14px] rounded-full" style={{ backgroundColor: '#D5D8DC', opacity: 0.6 }} />
        <div className="absolute bottom-[130px] left-[80px] w-[8px] h-[8px] rounded-full" style={{ backgroundColor: '#D5D8DC', opacity: 0.7 }} />
        <div className="absolute top-[240px] left-[150px] w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#D5D8DC', opacity: 0.5 }} />
        <div className="absolute bottom-[190px] right-[120px] w-[10px] h-[10px] rounded-full" style={{ backgroundColor: '#D5D8DC', opacity: 0.6 }} />
        <div className="absolute top-[320px] right-[160px] w-[6px] h-[6px] rounded-full" style={{ backgroundColor: '#D5D8DC', opacity: 0.55 }} />
        <div className="absolute bottom-[100px] right-[60px] w-[9px] h-[9px] rounded-full" style={{ backgroundColor: '#D5D8DC', opacity: 0.5 }} />
        <div className="absolute top-[200px] left-[40px] w-[5px] h-[5px] rounded-full" style={{ backgroundColor: '#D5D8DC', opacity: 0.6 }} />
        {/* Plus signs */}
        <div className="absolute top-[120px] right-[180px] text-[20px] font-light" style={{ color: '#D5D8DC' }}>+</div>
        <div className="absolute bottom-[220px] left-[140px] text-[20px] font-light" style={{ color: '#D5D8DC' }}>+</div>
        <div className="absolute top-[350px] left-[100px] text-[16px] font-light" style={{ color: '#D5D8DC' }}>+</div>
        <div className="absolute bottom-[300px] right-[80px] text-[18px] font-light" style={{ color: '#D5D8DC' }}>+</div>

        {/* Main Illustration */}
        <img
          src={loginIllustration}
          alt="Preproute Illustration"
          className="w-[420px] h-[420px] object-contain"
          draggable={false}
        />
      </div>

      {/* 1px Blue Border between panels */}
      <div className="hidden lg:block w-[1px] flex-shrink-0" style={{ backgroundColor: '#007AFF' }} />

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div style={{ width: '290px', textAlign: 'center' }}>
          {/* Logo with Text */}
          <div className="flex items-center justify-center gap-2">
            <img
              src={preprouteLogo}
              alt="PrepRoute"
              style={{ width: '32px', height: 'auto' }}
              draggable={false}
            />
            <span style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1E3A8A',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.5px'
            }}>
              PrepRoute
            </span>
          </div>

          {/* Login Heading */}
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', marginTop: '32px', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
            Login
          </h2>

          {/* Subtitle */}
          <p style={{ fontSize: '13px', fontWeight: 400, color: '#999999', marginTop: '8px', fontFamily: 'Inter, sans-serif', textAlign: 'center', lineHeight: '1.5' }}>
            Use your company provided Login credentials
          </p>

          {/* Error */}
          {error && (
            <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px', color: '#B91C1C', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
              <span>{error}</span>
              <button onClick={clearError} style={{ color: '#EF4444', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left', marginTop: '20px' }}>
            {/* User ID */}
            <div>
              <label
                htmlFor="userId"
                style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#333333', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}
              >
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#333333',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#007AFF'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginTop: '18px' }}>
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#333333', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#333333',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#007AFF'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E0E0E0'; }}
              />
            </div>

            {/* Forgot Password */}
            <div style={{ marginTop: '10px' }}>
              <a href="#" style={{ fontSize: '13px', color: '#007AFF', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !userId.trim() || !password.trim()}
              style={{
                width: '100%',
                height: '44px',
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading || !userId.trim() || !password.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !userId.trim() || !password.trim() ? 0.5 : 1,
                marginTop: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'Inter, sans-serif',
                transition: 'background-color 0.15s',
                boxSizing: 'border-box',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}