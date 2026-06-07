import { type ReactNode } from 'react';
import { useAuthStore } from '../../store';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, LogOut, ChevronDown, Bell } from 'lucide-react';
import preprouteLogo from '/public/preproute-logo.png';

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
      <aside className="w-[220px] bg-white border-r border-[#E5E7EB] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 flex items-center gap-2.5 border-b border-[#E5E7EB]">
          <img
            src={preprouteLogo}
            alt="Preproute"
            className="w-6 h-6"
            draggable={false}
          />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            PrepRoute
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-all ${
                  active
                    ? 'bg-[#5B7CFF] text-white shadow-sm'
                    : 'text-[#666666] hover:bg-[#F5F7FA] hover:text-[#333333]'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="px-3 py-3 border-t border-[#E5E7EB]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#666666] hover:text-[#333333] hover:bg-[#F5F7FA] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Right area: Top header + Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-[60px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          {/* Left: Empty or breadcrumb space */}
          <div className="flex items-center gap-2">
            {/* This space can be used for breadcrumbs or left empty */}
          </div>

          {/* Right: Notification + User info */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-[#666666]" />
              {/* Optional: notification badge dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User info */}
            <div className="flex items-center gap-3 cursor-pointer hover:bg-[#F9FAFB] px-3 py-2 rounded-lg transition-colors">
              <div className="w-9 h-9 rounded-full bg-[#FFA726] flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="text-left">
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
                  {user?.name || 'Alex Wando'}
                </p>
                <p style={{ fontSize: '12px', fontWeight: 400, color: '#666666', fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
                  Admin
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#666666]" />
            </div>
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