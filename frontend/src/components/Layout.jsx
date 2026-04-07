import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, BarChart2, Package,
  AlertTriangle, Settings, LogOut, Menu, X, ChevronRight,
  Building2
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Resumen Ejecutivo', exact: true },
  { to: '/avance-obra', icon: TrendingUp, label: 'Avance de Obra' },
  { to: '/curva-s', icon: BarChart2, label: 'Curva S' },
  { to: '/suministros', icon: Package, label: 'Suministros' },
  { to: '/restricciones', icon: AlertTriangle, label: 'Restricciones' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin, canEdit } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rolBadge = {
    admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
    editor: { label: 'Editor', color: 'bg-blue-100 text-blue-700' },
    viewer: { label: 'Lector', color: 'bg-slate-100 text-slate-600' },
  };
  const badge = rolBadge[user?.rol] || rolBadge.viewer;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-[#1a2744] text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">C MEJIA S.A.C.</p>
              <p className="text-sm font-bold text-white">PROYECTO MOTIL</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.nombre}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-slate-800 text-sm">PROYECTO MOTIL</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
