import { createClient } from '@sanity/client';



export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: import.meta.env.VITE_SANITY_TOKEN, // Only used if provided
});

if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
  console.warn('Sanity Project ID is missing. Blog features will not work.');
}
