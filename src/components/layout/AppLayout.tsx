import { type ReactNode } from 'react';
import { useAuthStore } from '../../store';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, LogOut, ChevronDown } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Test Creation', path: '/tests/new', icon: FileText },
    { label: 'Test Tracking', path: '/dashboard', icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#2D2D2D] text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 flex items-center gap-2.5">
          <img
            src="/preproute-logo.png"
            alt="Preproute"
            className="w-6 h-6"
            draggable={false}
          />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            PrepRoute
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-3 space-y-0.5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-[#5B7CFF] text-white'
                    : 'text-[#A0A0A0] hover:bg-[#3A3A3A] hover:text-white'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="px-3 py-3 border-t border-[#3A3A3A]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A] rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Right area: Top header + Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-[52px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/preproute-logo.png"
              alt="Preproute"
              className="w-5 h-5"
              draggable={false}
            />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#5B7CFF', fontFamily: 'Inter, sans-serif' }}>
              PrepRoute
            </span>
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#5B7CFF] flex items-center justify-center text-white font-semibold text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="text-right">
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                {user?.name || 'Alex Wando'}
              </p>
              <p style={{ fontSize: '11px', fontWeight: 400, color: '#888', fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                Admin
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#888]" />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}