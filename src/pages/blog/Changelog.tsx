import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../../lib/sanity/client';
import { CHANGELOG_POSTS_QUERY } from '../../lib/sanity/queries';
import { Post } from '../../lib/sanity/types';

const Changelog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateMetaTags();
    fetchChangelog();
  }, []);

  const updateMetaTags = () => {
    const title = 'Changelog | GradrAI';
    const description = 'All the latest updates, fixes, and improvements to the GradrAI platform.';
    
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

  const fetchChangelog = async () => {
    try {
      const data = await client.fetch(CHANGELOG_POSTS_QUERY);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching changelog:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 font-fraunces leading-tight">
            Changelog
          </h1>
          <p className="text-xl text-slate-600 font-dm-sans leading-relaxed">
            All the latest updates, fixes, and improvements to the GradrAI platform.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-24">
        {loading ? (
          <div className="space-y-12 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-8">
                <div className="w-24 h-4 bg-slate-200 rounded shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 font-medium">No changelog entries yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-32 py-4">
            {posts.map((post) => (
              <div key={post._id} className="mb-20 last:mb-0 relative pl-8 md:pl-16">
                {/* Connector Dot */}
                <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm ring-2 ring-primary/20" />

                {/* Date Side Label */}
                <div className="hidden md:block absolute -left-48 top-1 w-32 text-right">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                {/* Mobile Date Label */}
                <div className="md:hidden mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                <div className="group">
                  <Link
                    to={`/blog/${post.slug.current}`}
                    className="inline-block text-3xl font-bold text-slate-900 mb-4 font-fraunces hover:text-primary transition-colors leading-tight"
                  >
                    {post.title}
                  </Link>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-2xl font-dm-sans">
                    {post.summary}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-tight"
                      >
                       #{tag}
                      </span>
                    ))}
                    <Link
                      to={`/blog/${post.slug.current}`}
                      className="text-primary font-bold text-sm uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      Read full update →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Changelog;
