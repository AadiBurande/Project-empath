// src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const pillarCards = [
    {
      title: "Pillar 1: AI-Guided First-Aid",
      subtitle: "Multimodal Emotion AI & Triage",
      desc: "Speak or type anonymously with our empathetic Gemini companion. Real-time face, voice & text emotion fusion.",
      actionText: "Launch 24/7 AI Chat",
      link: "/chat",
      icon: "🤖",
      color: "border-l-indigo-600 bg-gradient-to-r from-indigo-50/50 to-white"
    },
    {
      title: "Pillar 2: Confidential Booking",
      subtitle: "Campus Counsellor Bridge",
      desc: "Quietly schedule 1-on-1 private appointments with your college's official psychological counsellors.",
      actionText: "Book Private Session",
      link: "/booking",
      icon: "📅",
      color: "border-l-purple-600 bg-gradient-to-r from-purple-50/50 to-white"
    },
    {
      title: "Pillar 3: Psychoeducational Hub",
      subtitle: "Self-Care Toolkit",
      desc: "Explore audio relaxations, 5-4-3-2-1 grounding, and exam/placement stress guides in English, Hindi & Marathi.",
      actionText: "Open Self-Care Library",
      link: "/resources",
      icon: "📚",
      color: "border-l-emerald-600 bg-gradient-to-r from-emerald-50/50 to-white"
    },
    {
      title: "Pillar 4: Peer Support Platform",
      subtitle: "Anonymous Community",
      desc: "Relate with fellow students on exam burnout, hostel life, and academic stress under safe creative aliases.",
      actionText: "Join Peer Discussion",
      link: "/community",
      icon: "💬",
      color: "border-l-amber-600 bg-gradient-to-r from-amber-50/50 to-white"
    },
    {
      title: "Pillar 5: Institutional Dashboard",
      subtitle: "Campus Policy Engine",
      desc: "Aggregated, anonymized well-being metrics for Deans & IQAC to deploy targeted workshops and support.",
      actionText: "View Admin Analytics",
      link: "/admin",
      icon: "📊",
      color: "border-l-rose-600 bg-gradient-to-r from-rose-50/50 to-white"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-grow flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200">
                Safe Campus Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-3">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
                {user?.college || 'Higher Education Institution'} — Your completely private and confidential mental health companion. How are you feeling today?
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🆘</span>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Need Urgent Crisis Support?</h4>
                <p className="text-xs text-amber-700">Free, confidential 24/7 helplines in India: AASRA (9820466726) | iCall (9152987821)</p>
              </div>
            </div>
            <a
              href="tel:9820466726"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs whitespace-nowrap"
            >
              Call Helpline
            </a>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-4">Project Empath Core Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {pillarCards.map((card, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all border-l-4 ${card.color} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{card.icon}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.subtitle}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{card.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{card.desc}</p>
                </div>

                <Link
                  to={card.link}
                  className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <span>{card.actionText}</span>
                  <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
