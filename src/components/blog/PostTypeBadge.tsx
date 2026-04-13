import React from 'react';
import { PostType } from '../../lib/sanity/types';

interface PostTypeBadgeProps {
  type: PostType;
}

const PostTypeBadge: React.FC<PostTypeBadgeProps> = ({ type }) => {
  const styles: Record<PostType, string> = {
    article: 'bg-blue-600 text-white',
    changelog: 'bg-slate-600 text-white',
    'product-update': 'bg-green-600 text-white',
    'hot-feature': 'bg-orange-600 text-white',
  };

  const labels: Record<PostType, string> = {
    article: 'Article',
    changelog: 'Changelog',
    'product-update': 'Product Update',
    'hot-feature': 'Hot Feature',
  };

  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${styles[type]}`}>
      {labels[type]}
    </span>
  );
};

export default PostTypeBadge;
