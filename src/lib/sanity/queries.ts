export const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  postType,
  summary,
  coverImage,
  publishedAt,
  tags,
  author->{
    name,
    avatar
  }
}`;

export const POSTS_BY_TYPE_QUERY = `*[_type == "post" && postType == $postType] | order(publishedAt desc) {
  _id,
  title,
  slug,
  postType,
  summary,
  coverImage,
  publishedAt,
  tags,
  author->{
    name,
    avatar
  }
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  ...,
  author->{
    name,
    role,
    avatar,
    bio
  }
}`;

export const RELATED_POSTS_QUERY = `*[_type == "post" && postType == $postType && slug.current != $slug] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  postType,
  summary,
  coverImage,
  publishedAt,
  tags,
  author->{
    name,
    avatar
  }
}`;

export const CHANGELOG_POSTS_QUERY = `*[_type == "post" && postType == "changelog"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  postType,
  summary,
  coverImage,
  publishedAt,
  tags,
  author->{
    name,
    avatar
  }
}`;
