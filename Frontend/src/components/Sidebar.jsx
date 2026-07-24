// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard Hub', path: '/dashboard', icon: '📊' },
    { label: 'AI First-Aid (Chat)', path: '/chat', icon: '🤖', badge: '24/7 Triage' },
    { label: 'Campus Counsellors', path: '/booking', icon: '📅', badge: 'Confidential' },
    { label: 'Self-Care Toolkit', path: '/resources', icon: '📚', badge: '3 Languages' },
    { label: 'Peer Support Forum', path: '/community', icon: '💬', badge: 'Anonymous' },
    { label: 'Admin Analytics', path: '/admin', icon: '📈', badge: 'Policy Engine' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="mb-6 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Student'}</p>
          <p className="text-xs text-gray-500 truncate">{user?.college || 'Higher Education'}</p>
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">5 Key Pillars</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 px-3 text-xs text-gray-500 text-center">
        <p className="font-semibold text-gray-700">Project Empath v1.0</p>
        <p className="text-[11px] text-gray-400 mt-1">Culturally-tailored digital mental health platform</p>
      </div>
    </aside>
  );
};

export default Sidebar;
