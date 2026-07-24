// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { fetchApi } from '../utils/api';

const AdminPage = () => {
  const [data, setData] = useState(null);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    loadFlaggedPosts();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetchApi('/admin/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlaggedPosts = async () => {
    try {
      const res = await fetchApi('/admin/flagged-posts');
      if (res.success) {
        setFlaggedPosts(res.flagged_posts);
      }
    } catch (err) {
      console.error('Error loading flagged posts:', err);
    }
  };

  const handleResolveFlag = async (postId, action) => {
    try {
      const res = await fetchApi(`/admin/flagged-posts/${postId}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
      if (res.success) {
        loadFlaggedPosts();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-bold">Loading Institutional Policy Dashboard...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const emotionDist = data?.emotion_distribution || {};
  const stressors = data?.stressor_breakdown || [];
  const hourlyTrend = data?.hourly_trend || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-grow flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full uppercase tracking-wider">
                  Admin & IQAC Portal
                </span>
                <span className="text-xs text-slate-400">Real-Time Anonymized Telemetry</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Campus Well-Being & Policy Engine</h1>
              <p className="text-xs text-slate-500">{data?.institution || 'Higher Education Institution'}</p>
            </div>

            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              🔄 Refresh Analytics
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Students</span>
              <span className="text-2xl font-black text-slate-900">{metrics.total_students}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">AI Triage Sessions</span>
              <span className="text-2xl font-black text-indigo-600">{metrics.total_sessions}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Sessions Booked</span>
              <span className="text-2xl font-black text-purple-600">{metrics.total_appointments}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Peer Posts</span>
              <span className="text-2xl font-black text-amber-600">{metrics.total_community_posts}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Safety Flags</span>
              <span className="text-2xl font-black text-rose-600">{metrics.flagged_posts_count}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <span>🎨</span> Campus Emotion Distribution
              </h3>

              <div className="space-y-4">
                {Object.entries(emotionDist).map(([emotion, pct]) => (
                  <div key={emotion}>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1 capitalize">
                      <span>{emotion}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <span>🔥</span> Top Reported Academic Stressors
              </h3>

              <div className="space-y-4">
                {stressors.map((s, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{s.category}</span>
                      <span>{s.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <span>🕒</span> Hourly Distress Telemetry (Late-Night Spike Analysis)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Time Window</th>
                    <th className="pb-3">AI Interventions Logged</th>
                    <th className="pb-3">Distress Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hourlyTrend.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 font-bold text-slate-900">{row.hour}</td>
                      <td className="py-3.5 text-slate-700">{row.sessions} sessions</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          row.risk.includes('Spike') ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {row.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>💡</span> AI Policy Recommendations for Campus Authorities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-indigo-200">{rec.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <span>🛡️</span> Safety Moderation Queue ({flaggedPosts.length} Flagged Posts)
            </h3>

            {flaggedPosts.length > 0 ? (
              <div className="space-y-4">
                {flaggedPosts.map((post) => (
                  <div key={post._id} className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-rose-900 block mb-1">Title: {post.title}</span>
                      <p className="text-slate-700 italic">"{post.content}"</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Author: {post.author_alias}</span>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveFlag(post._id, 'unflag')}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg"
                      >
                        Approve Post
                      </button>
                      <button
                        onClick={() => handleResolveFlag(post._id, 'delete')}
                        className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg"
                      >
                        Delete Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No community posts currently flagged for safety review.</p>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPage;
