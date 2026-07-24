// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            E
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
              Project Empath
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Campus Mental Health
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">
          <Link to="/resources" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Self-Care Toolkit
          </Link>
          <Link to="/community" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Peer Forum
          </Link>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard" 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600">
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
