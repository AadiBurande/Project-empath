// src/pages/ResourcesPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { fetchApi } from '../utils/api';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Grounding', 'Breathing', 'Career Stress', 'Resilience'];
  const languages = [
    { code: 'all', label: 'All Languages' },
    { code: 'en', label: 'English 🇬🇧' },
    { code: 'hi', label: 'हिंदी (Hindi) 🇮🇳' },
    { code: 'mr', label: 'मराठी (Marathi) 🇮🇳' }
  ];

  useEffect(() => {
    loadResources();
  }, [category, language, search]);

  const loadResources = async () => {
    try {
      let query = `?category=${category}&language=${language}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await fetchApi(`/resources${query}`);
      if (res.success) {
        setResources(res.resources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-grow flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Psychoeducational Resource Hub</h1>
            <p className="text-xs text-slate-500 mt-1">Self-care toolkits tailored for Indian higher education stressors (exams, placements, homesickness).</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources by keyword..."
                className="w-full sm:w-80 px-4 py-2 rounded-xl border border-slate-300 text-xs"
              />

              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      language === lang.code
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    category === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedResource(item)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      ⏱️ {item.read_time_minutes} min
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{item.title}</h3>
                  <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-emerald-600">Read & Practice →</span>
                </div>
              </div>
            ))}
          </div>

          {selectedResource && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white max-w-2xl w-full rounded-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
                <button
                  onClick={() => setSelectedResource(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg"
                >
                  ✕
                </button>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full uppercase tracking-wider mb-3 inline-block">
                  {selectedResource.category} ({selectedResource.language.toUpperCase()})
                </span>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedResource.title}</h2>
                <p className="text-xs text-slate-500 mb-6">{selectedResource.description}</p>

                <div className="prose text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  {selectedResource.content}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Close Resource
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ResourcesPage;
