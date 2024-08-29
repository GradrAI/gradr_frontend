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
    heading: "Ut enim ad minima veniam, quis nostrum exercitationem ullam?",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  },
  {
    heading: "Ut enim ad minima veniam, quis nostrum exercitationem ullam?",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  },
  {
    heading: "Ut enim ad minima veniam, quis nostrum exercitationem ullam?",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  },
  {
    heading: "Ut enim ad minima veniam, quis nostrum exercitationem ullam?",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
  },
];
