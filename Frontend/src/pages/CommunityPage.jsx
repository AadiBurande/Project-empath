// src/pages/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { fetchApi } from '../utils/api';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Placement Stress');
  const [activePost, setActivePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [crisisAlert, setCrisisAlert] = useState(null);

  const tags = ['All', 'Placement Stress', 'Exam Pressure', 'Homesickness', 'Mental Health', 'General Venting'];

  useEffect(() => {
    loadPosts();
  }, [selectedTag]);

  const loadPosts = async () => {
    try {
      const res = await fetchApi(`/community/posts?tag=${selectedTag}`);
      if (res.success) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const res = await fetchApi('/community/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content, tag })
      });

      if (res.success) {
        setShowCreateModal(false);
        setTitle('');
        setContent('');
        loadPosts();

        if (res.crisis_notice) {
          setCrisisAlert(res.crisis_notice);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to publish post');
    }
  };

  const handleRelate = async (postId) => {
    try {
      const res = await fetchApi(`/community/posts/${postId}/relate`, { method: 'POST' });
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, relate_count: p.relate_count + 1 } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openComments = async (post) => {
    setActivePost(post);
    try {
      const res = await fetchApi(`/community/posts/${post._id}/comments`);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !activePost) return;

    try {
      const res = await fetchApi(`/community/posts/${activePost._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentInput })
      });

      if (res.success) {
        setComments((prev) => [...prev, res.comment]);
        setCommentInput('');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-grow flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Moderated Peer Support Platform</h1>
              <p className="text-xs text-slate-500 mt-1">Connect anonymously with fellow students under creative aliases. Safe & monitored.</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>✍️</span> Post Anonymously
            </button>
          </div>

          {crisisAlert && (
            <div className="mb-6 p-5 bg-rose-50 border border-rose-200 rounded-2xl">
              <h4 className="font-bold text-rose-900 text-sm mb-1">💙 Safety Support Notice</h4>
              <p className="text-xs text-rose-700 mb-3">{crisisAlert.message}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTag === t
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-w-3xl">
            {posts.map((p) => (
              <div key={p._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      🕵️
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{p.author_alias}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    #{p.tag}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2">{p.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 whitespace-pre-line">{p.content}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleRelate(p._id)}
                    className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <span>🤗</span> I Relate ({p.relate_count})
                  </button>

                  <button
                    onClick={() => openComments(p)}
                    className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <span>💬</span> Reply / Comments ({p.comments_count})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg"
                >
                  ✕
                </button>

                <h2 className="text-xl font-bold text-slate-900 mb-1">Post Anonymously</h2>

                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Topic Tag
                    </label>
                    <select
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
                    >
                      <option value="Placement Stress">Placement Stress</option>
                      <option value="Exam Pressure">Exam Pressure</option>
                      <option value="Homesickness">Homesickness</option>
                      <option value="Mental Health">Mental Health</option>
                      <option value="General Venting">General Venting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Post Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Struggling with placement interview anxiety..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Content
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share what is on your mind..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Publish Anonymous Post 🔒
                  </button>
                </form>
              </div>
            </div>
          )}

          {activePost && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white max-w-xl w-full rounded-2xl p-6 sm:p-8 max-h-[80vh] flex flex-col shadow-2xl relative">
                <button
                  onClick={() => setActivePost(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-lg"
                >
                  ✕
                </button>

                <h3 className="font-bold text-slate-900 text-lg mb-1">{activePost.title}</h3>
                <p className="text-xs text-slate-500 mb-4">Posted by {activePost.author_alias}</p>

                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-200">
                  {comments.map((c) => (
                    <div key={c._id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <span className="font-bold text-indigo-700 block mb-0.5">{c.author_alias}</span>
                      <p className="text-slate-700">{c.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No comments yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write an encouraging anonymous reply..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Reply
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CommunityPage;
