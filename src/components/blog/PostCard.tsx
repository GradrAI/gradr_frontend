import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../lib/sanity/types';
import { urlFor } from '../../lib/sanity/image';
import PostTypeBadge from './PostTypeBadge';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/blog/${post.slug.current}`}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {post.coverImage ? (
          <img
            src={urlFor(post.coverImage).width(800).url()}
            alt={post.coverImage.alt || post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
        )}
        <div className="absolute top-3 left-3">
          <PostTypeBadge type={post.postType} />
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-2 font-fraunces">
          {post.title}
        </h3>
        <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {post.summary}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3">
          {post.author?.avatar ? (
            <img
              src={urlFor(post.author.avatar).width(48).height(48).url()}
              alt={post.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200" />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-tight">
              {post.author?.name || 'GradrAI Team'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
