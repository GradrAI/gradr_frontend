export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export interface Author {
  name: string;
  slug: { current: string };
  role?: string;
  avatar?: SanityImage;
  bio?: string;
}

export type PostType = 'article' | 'changelog' | 'product-update' | 'hot-feature';

export interface Post {
  _id: string;
  _createdAt?: string;
  title: string;
  slug: { current: string };
  postType: PostType;
  summary: string;
  coverImage?: SanityImage;
  publishedAt: string;
  tags?: string[];
  author?: Author;
  body?: any[]; // PortableTextBlock[]
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  };
}
