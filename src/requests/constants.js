import {
  profile1,
  profile2,
  profile3,
  profile4,
  appStore,
  twitter,
  google,
} from "../assets";

export const BASE_URL = import.meta.env.DEV
  ? "http://localhost:4040"
  : "https://gradr-backend.onrender.com";

export const users = [
  {
    image: profile1,
    name: "Grant Styles",
    position: "Senior Lecturer at NYU",
    icon: appStore,
    text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet? Ut enim ad minima veniam, quis nostrum exercitationem ullam.",
  },
  {
    image: profile2,
    name: "Ralph Edwards",
    position: "President, MIT",
    icon: twitter,
    text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet? Ut enim ad minima veniam, quis nostrum exercitationem ullam.",
  },
  {
    image: profile3,
    name: "Robert Fox",
    position: "Senior Lecturer at NYU",
    icon: google,
    text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet? Ut enim ad minima veniam, quis nostrum exercitationem ullam.",
  },
  {
    image: profile4,
    name: "Grant Styles",
    position: "Senior Lecturer at NYU",
    icon: appStore,
    text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet? Ut enim ad minima veniam, quis nostrum exercitationem ullam.",
  },
  {
    image: profile1,
    name: "Grant Styles",
    position: "Senior Lecturer at NYU",
    icon: twitter,
    text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet? Ut enim ad minima veniam, quis nostrum exercitationem ullam.",
  },
  {
    image: profile2,
    name: "Grant Styles",
    position: "Senior Lecturer at NYU",
    icon: google,
    text: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet? Ut enim ad minima veniam, quis nostrum exercitationem ullam.",
  },
];

export const faqs = [
  {
    heading: "What type of exams can Gradr grade?",
    text: "Gradr currently only grades paper-based tests. This is subject to change in the nearest future to allow assessment of other forms of examination.",
  },
  {
    heading: "Can Gradr assess scripts with illegible handwriting?",
    text: "Yes. Gradr uses Google Gemini which has been trained with a large dataset and performs well even with illegible handwriting.",
  },
  {
    heading: "How reliable is Gradr?",
    text: "Gradr works realiably well. We are constantly working to improve this.",
  },
  {
    heading: "How does Gradr measure accuracy?",
    text: "We are undergoing the process of giving exact figures into this metric. This feature will be added soon.",
  },
];
