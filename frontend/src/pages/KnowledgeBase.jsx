import React, { useState } from 'react';
import { useKB } from '../hooks/useKB';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, BookOpen, FileText, Loader2, AlertCircle, HelpCircle, X } from 'lucide-react';

export default function KnowledgeBase() {
  const { user } = useAuth();
  
  // States
  const [searchVal, setSearchVal] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Compose article form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch articles via hook (debounced query automatically triggered when searchVal changes)
  const { articles, isLoadingArticles, createArticle, isCreatingArticle } = useKB(searchVal, categoryFilter);

  const isAgent = user?.role === 'agent' || user?.role === 'admin';

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await createArticle({
        title,
        content,
        category,
        tags: [category],
      });
      setTitle('');
      setContent('');
      setCategory('general');
      setIsWriteOpen(false);
      setSuccessMsg('Article published successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-300 overflow-y-auto h-[calc(100vh-4rem)]">
      {/* Top Title Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wide">Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search documentation or publish articles to help customers resolve issues.
          </p>
        </div>

        {isAgent && (
          <button
            onClick={() => setIsWriteOpen(!isWriteOpen)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md hover:shadow-brand-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Write Article
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-xs border border-emerald-500/20 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* COLLAPSIBLE WRITE PANEL (AGENTS ONLY) */}
      {isWriteOpen && isAgent && (
        <div className="mb-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-premium-lg">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Compose Help Documentation</h2>
          <form onSubmit={handleComposeSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How to request a billing invoice refund"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-3 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Topic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 py-3 px-3 bg-slate-950 text-xs text-slate-300 focus:border-brand-500 focus:outline-none shadow-sm font-bold"
                >
                  <option value="billing">Billing & Pricing</option>
                  <option value="bug">System Troubleshooting</option>
                  <option value="technical">Developer Integration</option>
                  <option value="general">General Usage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                Article Body / Content
              </label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write clear, step-by-step instructions. Explain terms, provide links, or troubleshoot tips..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-3 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none shadow-sm"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setIsWriteOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300 bg-slate-950 border border-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isCreatingArticle}
                className="bg-slate-200 hover:bg-slate-300 text-slate-950 px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isCreatingArticle ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Article</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search matching articles (e.g. invoice, refund, setup)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-3.5 pl-11 pr-3 text-slate-200 placeholder-slate-500 shadow-inner focus:border-brand-500 focus:outline-none text-xs transition-all"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 py-3.5 px-3.5 text-xs text-slate-400 focus:border-brand-500 focus:outline-none shadow-sm font-bold cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="billing">Billing & Pricing</option>
          <option value="bug">System Troubleshooting</option>
          <option value="technical">Developer Integration</option>
          <option value="general">General Usage</option>
        </select>
      </div>

      {/* ARTICLES GRID */}
      {isLoadingArticles ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800">
          <HelpCircle className="h-12 w-12 text-slate-700 mx-auto mb-3 animate-pulse" />
          <h3 className="text-white font-extrabold uppercase text-xs tracking-wider">No documentation articles found</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto mt-1 leading-relaxed">
            Try adjusting your search criteria or filter to browse our documentation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art._id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-premium hover:shadow-premium-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {new Date(art.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-2 leading-snug line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line line-clamp-4">
                  {art.content}
                </p>
              </div>

              <div className="border-t border-slate-800 mt-4 pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  By <span className="font-extrabold text-slate-400">{art.createdBy?.name || 'Staff'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(art)}
                  className="text-[10px] text-brand-400 font-extrabold uppercase tracking-wide hover:text-brand-300 cursor-pointer"
                >
                  Read Full Article
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl max-h-[86vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-premium-lg">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-950/60 p-5">
              <div>
                <span className="inline-flex rounded bg-brand-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-brand-400 border border-brand-500/20">
                  {selectedArticle.category}
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-white leading-snug">{selectedArticle.title}</h2>
                <p className="mt-1 text-[11px] text-slate-500 font-bold">
                  By {selectedArticle.createdBy?.name || 'Staff'} · {new Date(selectedArticle.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                aria-label="Close article"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-300">{selectedArticle.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


