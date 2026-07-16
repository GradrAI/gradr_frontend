import { useEffect, useState } from 'react';
import { client } from '../../lib/sanity/client';
import { POSTS_QUERY, POSTS_BY_TYPE_QUERY } from '../../lib/sanity/queries';
import { Post } from '../../lib/sanity/types';
import PostGrid from '../../components/blog/PostGrid';
import FilterTabs from '../../components/blog/FilterTabs';

const BlogIndex = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState('');

  useEffect(() => {
    updateMetaTags();
    fetchPosts();
  }, [activeType]);

  const updateMetaTags = () => {
    const title = 'Blog | GradrAI';
    const description = 'Stay informed with the latest from GradrAI—your partner in modernizing assessment grading worldwide.';
    
    document.title = title;

    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', window.location.href);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = activeType ? POSTS_BY_TYPE_QUERY : POSTS_QUERY;
      const params = activeType ? { postType: activeType } : {};
      const data = await client.fetch(query, params);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 lg:px-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 font-fraunces leading-tight max-w-4xl">
            EdTech insights and <span className="text-primary italic">product updates.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl font-dm-sans leading-relaxed">
            Stay informed with the latest from GradrAI—your partner in modernizing assessment grading worldwide.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="mb-12">
          <FilterTabs activeType={activeType} onTypeChange={setActiveType} />
        </div>

        {error ? (
          <div className="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium">
            {error}
          </div>
        ) : (
          <PostGrid posts={posts} loading={loading} />
        )}
      </main>
    </div>
  );
};

export default BlogIndex;
