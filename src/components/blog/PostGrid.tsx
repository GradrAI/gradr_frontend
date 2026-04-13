import React from 'react';
import { Post } from '../../lib/sanity/types';
import PostCard from './PostCard';

interface PostGridProps {
  posts: Post[];
  loading?: boolean;
}

const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-video bg-slate-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/4" />
      <div className="h-6 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
      <div className="pt-4 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-slate-200" />
        <div className="h-3 bg-slate-200 rounded w-1/3" />
      </div>
    </div>
  </div>
);

const PostGrid: React.FC<PostGridProps> = ({ posts, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <p className="text-slate-500 font-medium">No posts found matching your selection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostGrid;
