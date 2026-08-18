import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { NewsPost } from '../types';
import {
  Newspaper,
  Pin,
  Eye,
  Calendar,
  Search,
  ChevronRight,
  X,
  FileText,
  User,
} from 'lucide-react';

export const NewsSection: React.FC = () => {
  const { newsPosts, incrementNewsViews } = useCMS();

  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  const categories = ['전체', '공지사항', '기술자료', '보도자료', '설비도입'];

  const filteredPosts = newsPosts.filter((post) => {
    const matchesCategory = activeCategory === '전체' || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenPost = (post: NewsPost) => {
    incrementNewsViews(post.id);
    setSelectedPost(post);
  };

  return (
    <section id="news" className="py-24 bg-black relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            <Newspaper className="w-3.5 h-3.5" />
            <span>NEWS & ANNOUNCEMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            백송이엔지 소식 및
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
              최신 기술 게시글 / 공지사항
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            신규 공장 증설, 최첨단 CMM 및 5축 가공기 도입 소식, 가공 기술 연구자료를 확인하실 수 있습니다.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`news-cat-${cat}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="검색어 입력..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* News List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handleOpenPost(post)}
              className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                post.pinned
                  ? 'bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 border-purple-500/40 shadow-xl'
                  : 'bg-zinc-900/60 border-white/10 hover:border-purple-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-bold">
                    {post.category}
                  </span>
                  {post.pinned && (
                    <span className="flex items-center gap-1 text-[11px] text-purple-400 font-bold">
                      <Pin className="w-3.5 h-3.5" />
                      중요
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    {post.author}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-purple-400">
                  <Eye className="w-3.5 h-3.5" />
                  {post.views}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-white/10">
            검색 결과에 해당하는 소식이 없습니다.
          </div>
        )}
      </div>

      {/* Post Detail Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              id="close-post-modal"
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                {selectedPost.category}
              </span>
              <span className="text-xs text-zinc-500 font-mono">{selectedPost.date}</span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-4 leading-snug">
              {selectedPost.title}
            </h3>

            <div className="flex items-center gap-4 text-xs text-zinc-400 border-b border-white/10 pb-4 mb-6">
              <span>작성자: {selectedPost.author}</span>
              <span>조회수: {selectedPost.views}</span>
            </div>

            {selectedPost.imageUrl && (
              <div className="rounded-2xl overflow-hidden h-60 mb-6 bg-black border border-white/10">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line space-y-4 font-normal">
              {selectedPost.content}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
