import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';
import { SanityImage } from './types';

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
