import {
  profile1,
  profile2,
  profile3,
  profile4,
  appStore,
  twitter,
  google,
} from "../assets";
import { FAQ } from "../types/faqs";

export const BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_BACKEND_URL_DEV
  : import.meta.env.VITE_BACKEND_URL_PROD;

export const faqs: FAQ[] = [
  {
    heading: "What type of exams can GradrAI grade?",
    text: "GradrAI currently only grades paper-based exams. This is subject to change soon to allow assessment of other forms of examination.",
  },
  {
    heading: "Can GradrAI assess scripts with illegible handwriting?",
    text: "Yes. GradrAI uses state-of-the-art AI models which have been trained with large datasets and performs well even with illegible handwriting.",
  },
  {
    heading: "How reliable is GradrAI?",
    text: "GradrAI uses the provided resources and/or resources from the internet to assess student attempts at an examination. We are constantly working to improve its reliability.",
  },
  {
    heading: "How does GradrAI measure accuracy?",
    text: "We are undergoing the process of giving exact figures into this metric. This feature will be added soon.",
  },
];

export const ACCEPTED_FILE_TYPES = ["application/pdf"];
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
