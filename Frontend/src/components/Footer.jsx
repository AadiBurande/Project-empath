// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 p-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Project Empath — Open-Source Digital Mental Health System for Indian Higher Education.</p>
        <div className="flex gap-4 font-semibold text-gray-700">
          <span>24/7 Helpline: 9820466726</span>
          <span>•</span>
          <span>Open Source</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
