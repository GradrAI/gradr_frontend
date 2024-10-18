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
  ? "http://localhost:4040/api"
  : "https://gradr-backend.onrender.com/api";

export const faqs: FAQ[] = [
  {
    heading: "What type of exams can Gradr grade?",
    text: "Gradr currently only grades paper-based exams. This is subject to change soon to allow assessment of other forms of examination.",
  },
  {
    heading: "Can Gradr assess scripts with illegible handwriting?",
    text: "Yes. Gradr uses state-of-the-art AI models which have been trained with large datasets and performs well even with illegible handwriting.",
  },
  {
    heading: "How reliable is Gradr?",
    text: "Gradr uses the provided resources and/or resources from the internet to assess student attempts at an examination. We are constantly working to improve its reliability.",
  },
  {
    heading: "How does Gradr measure accuracy?",
    text: "We are undergoing the process of giving exact figures into this metric. This feature will be added soon.",
  },
];
