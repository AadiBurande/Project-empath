// src/pages/WelcomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WelcomePage = () => {
  const pillars = [
    {
      title: "1. AI-Guided First-Aid",
      subtitle: "24/7 Triage System",
      description: "An intelligent, empathetic multimodal companion that listens via voice or text, detects emotional severity, and guides you through grounding exercises.",
      icon: "🤖",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "2. Confidential Counsellor Booking",
      subtitle: "The Campus Bridge",
      description: "Eliminate the stigma of walking into a clinic. Quietly schedule private 1-on-1 slots directly with campus counsellors.",
      icon: "📅",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "3. Regional Resource Hub",
      subtitle: "Self-Care Toolkit",
      description: "Culturally tailored guides, audio relaxations, and videos available in Hindi, Marathi, and English addressing exam & placement stress.",
      icon: "📚",
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "4. Moderated Peer Forum",
      subtitle: "Anonymous Community",
      description: "A safe space to vent and share experiences with fellow students under auto-assigned creative aliases, safely moderated.",
      icon: "💬",
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "5. Institutional Admin Dashboard",
      subtitle: "The Policy Engine",
      description: "Aggregates anonymized campus well-being data to empower college authorities (IQAC, Deans) to deploy proactive mental health policies.",
      icon: "📊",
      color: "from-indigo-600 to-violet-700"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-semibold border border-indigo-500/30 mb-6">
              Digital Mental Health System for Indian Higher Education
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Bridging the gap between <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                students in silence
              </span> and campus care.
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Project Empath is a culturally-tailored, institution-integrated platform providing AI-guided first-aid, anonymous peer support, regional psychoeducational resources, and confidential booking for campus counsellors.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/chat"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 transition-all"
              >
                Talk to AI Companion Now 🤖
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg border border-white/20 backdrop-blur-md transition-all"
              >
                Create Student Account
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              The 5 Pillars of Project Empath
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A complete end-to-end digital ecosystem designed specifically for the academic and cultural pressures of Indian college life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${p.color} text-white text-3xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                    {p.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 block">
                    {p.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{p.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WelcomePage;
