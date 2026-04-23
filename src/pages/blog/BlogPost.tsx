import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { client } from '../../lib/sanity/client';
import { POST_BY_SLUG_QUERY, RELATED_POSTS_QUERY } from '../../lib/sanity/queries';
import { Post } from '../../lib/sanity/types';
import { urlFor } from '../../lib/sanity/image';
import PostTypeBadge from '../../components/blog/PostTypeBadge';
import PortableTextComponents from '../../components/blog/PortableTextComponents';
import TableOfContents from '../../components/blog/TableOfContents';
import PostCard from '../../components/blog/PostCard';
import { ArrowRight } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchData(slug);
  }, [slug]);

  const fetchData = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.fetch(POST_BY_SLUG_QUERY, { slug });
      if (!data) {
        setError('Post not found');
        return;
      }
      setPost(data);
      updateMetaTags(data);

      // Fetch related posts
      const related = await client.fetch(RELATED_POSTS_QUERY, {
        postType: data.postType,
        slug: data.slug.current,
      });
      setRelatedPosts(related);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('An error occurred while loading the post.');
    } finally {
      setLoading(false);
    }
  };

  const updateMetaTags = (data: Post) => {
    const title = data.seo?.metaTitle || data.title;
    const description = data.seo?.metaDescription || data.summary;
    const siteTitle = 'GradrAI Blog';
    const fullTitle = `${title} | ${siteTitle}`;

    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // SEO Meta Tags
    setMetaTag('name', 'description', description);

    // Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:url', window.location.href);

    // Twitter
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:card', 'summary_large_image');

    // Image logic
    const ogImage = data.seo?.ogImage || data.coverImage;
    if (ogImage) {
      const imageUrl = urlFor(ogImage).width(1200).height(630).auto('format').url();
      setMetaTag('property', 'og:image', imageUrl);
      setMetaTag('name', 'twitter:image', imageUrl);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto animate-pulse">
        <div className="w-full aspect-video bg-slate-200 rounded-2xl mb-12" />
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-12 bg-slate-200 rounded w-full" />
          <div className="h-12 bg-slate-200 rounded w-3/4" />
          <div className="pt-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-32" />
              <div className="h-3 bg-slate-200 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold font-fraunces mb-4 text-slate-900">{error || 'Post not found'}</h2>
        <Link to="/blog" className="text-primary font-bold hover:underline flex items-center gap-2">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  // Calculate read time
  const wordCount = post.body?.reduce((acc: number, block: any) => {
    if (block._type !== 'block') return acc;
    return acc + block.children.reduce((acc2: number, child: any) => acc2 + (child.text?.split(/\s+/)?.length || 0), 0);
  }, 0) || 0;
  const readTime = Math.ceil(wordCount / 200);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Back Link Top */}
      <div className="pt-24 pb-8 px-6 lg:px-12 max-w-7xl mx-auto">
        <Link to="/blog" className="text-slate-500 hover:text-primary transition-colors font-bold text-sm tracking-widest uppercase flex items-center gap-2">
          ← Back to Blog
        </Link>
      </div>

      {/* Hero Header */}
      <header className="px-6 lg:px-12 max-w-7xl mx-auto mb-16">
        <div className="rounded-2xl overflow-hidden aspect-[21/9] mb-12 border border-slate-200 shadow-xl">
          {post.coverImage ? (
            <img
              src={urlFor(post.coverImage).width(1600).url()}
              alt={post.coverImage.alt || post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-800" />
          )}
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <PostTypeBadge type={post.postType} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 font-fraunces leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-8 border-y border-slate-100 italic">
            <div className="flex items-center gap-4">
              {post.author?.avatar ? (
                <img
                  src={urlFor(post.author.avatar).width(48).height(48).url()}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100" />
              )}
              <div className="text-left">
                <p className="font-bold text-slate-900 not-italic uppercase tracking-tight text-sm">
                  {post.author?.name}
                </p>
                <p className="text-xs text-slate-500 font-medium">{post.author?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm text-slate-500 font-medium">
              <div className="flex flex-col">
                <span className="uppercase text-[10px] tracking-widest text-slate-400 font-bold mb-0.5">Published</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="uppercase text-[10px] tracking-widest text-slate-400 font-bold mb-0.5">Read Time</span>
                <span>{readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Layout */}
      <div className="px-6 lg:px-12 max-w-7xl mx-auto pb-24">
        <div className="flex flex-col lg:flex-row gap-16 justify-center">
          {/* Main Article Body */}
          <article className="max-w-3xl w-full">
            <PortableText value={post.body || []} components={PortableTextComponents} />

            {/* Author Bio Footer */}
            <div className="mt-24 p-8 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-8">
              {post.author?.avatar && (
                <img
                  src={urlFor(post.author.avatar).width(120).height(120).url()}
                  alt={post.author.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
              )}
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2 font-fraunces">
                  About {post.author?.name}
                </h4>
                <p className="text-slate-600 leading-relaxed font-dm-sans">
                  {post.author?.bio}
                </p>
              </div>
            </div>

            {/* Back to Blog Bottom */}
            <div className="mt-16 pt-8 border-t border-slate-100">
               <Link to="/blog" className="text-primary font-bold hover:underline flex items-center gap-2">
                ← Back to all posts
              </Link>
            </div>
          </article>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block">
            <TableOfContents body={post.body || []} />
          </aside>
        </div>
      </div>

      {/* CTA Section */}
      <section className="my-24 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-primary to-indigo-900 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold font-fraunces mb-6">
              Ready to transform your assessment workflow?
            </h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed">
              Join leading institutions across Africa using GradrAI to save time, increase accuracy, and deliver better student outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-xl group"
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-slate-50 py-24 px-6 lg:px-12 border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 font-fraunces">More from GradrAI</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <PostCard key={related._id} post={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
