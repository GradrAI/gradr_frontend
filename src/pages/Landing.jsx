import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "semantic-ui-react";
import {
  dashboardDesign,
  logo,
  marking,
  lingkaran,
  updown,
  clock,
  chart,
  notes,
} from "../assets";
import { faqs } from "../requests/constants";
import CustomDropdown from "../components/CustomDropdown";
import "./customMask.css";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useStore from "@/state";

const Landing = () => {
  const nav = useNavigate();
  const { user, setAccountType } = useStore();
  const [openIndex, setOpenIndex] = useState(null);

  const featuresRef = useRef(null);
  const faqsRef = useRef(null);
  const gradingRef = useRef(null);
  const contactRef = useRef(null);

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSignIn = () => {
    if (user) nav("/app/assessments");
    else {
      setAccountType("individual");
      nav("app");
    }
  };

  return (
    <div className="font-sans">
      <header className="w-full flex items-center justify-between py-4 px-4 md:px-12 bg-gray-800">
        <img src={logo} alt="gradr logo" />

        <div className="hidden md:flex items-center justify-between gap-2 w-1/4">
          <p
            className="m-0 text-white hover:text-pink-500 font-normal cursor-pointer font-fredoka"
            onClick={() =>
              featuresRef.current.scrollIntoView({
                behaviour: "smooth",
                block: "start",
              })
            }
          >
            Features
          </p>
          <p
            className="m-0 text-white hover:text-pink-500 font-normal cursor-pointer font-fredoka"
            onClick={() =>
              gradingRef.current.scrollIntoView({
                behaviour: "smooth",
                block: "start",
              })
            }
          >
            Grading
          </p>
          <p
            className="m-0 text-white hover:text-pink-500 font-normal cursor-pointer font-fredoka"
            onClick={() =>
              faqsRef.current.scrollIntoView({
                behaviour: "smooth",
                block: "start",
              })
            }
          >
            FAQs
          </p>
          <p
            className="m-0 text-white hover:text-pink-500 font-normal cursor-pointer font-fredoka"
            onClick={() =>
              contactRef.current.scrollIntoView({
                behaviour: "smooth",
                block: "start",
              })
            }
          >
            Contact
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p
            className="m-0 text-white hover:text-pink-500 font-semibold cursor-pointer"
            onClick={handleSignIn}
          >
            Sign in
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-white hover:text-white bg-pink-500 hover:bg-pink-600 border-none"
              >
                Sign Up
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="">
              <DropdownMenuItem
                onClick={() => {
                  setAccountType("individual");
                  nav("/app");
                }}
              >
                As Individual
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setAccountType("organization");
                  nav("app");
                }}
              >
                As Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-col items-center md:justify-start gap-10 p-4 md:p-6 md:gap-2 py-2 w-full h-[100dvh] bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 relative">
        <h1 className="text-5xl md:text-7xl text-center m-0 text-white w-full md:w-[50%] md:py-8 z-9 leading-normal md:tracking-wide tracking-normal font-poppins">
          Break Free From Manual Grading!
        </h1>
        <h2 className="text-2xl text-center text-white font-normal drop-shadow-lg leading-normal m-0 p-2 w-full md:w-[45%] font-fredoka">
          Save hours of tedious grading time and focus more on what matters most
          - fostering innovation.
        </h2>
        <Button
          className="py-6 px-4 text-lg font-raleway bg-pink-500 hover:bg-pink-600 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.3)] duration-300 hover:shadow-[6px_6px_12px_rgba(0,0,0,0.4)]"
          onClick={() =>
            window.open(
              "mailto:support@gradrai.com?subject=Register for early access&body=Hello there, I would like to request for early access to gradrai",
              "_blank"
            )
          }
        >
          Register for early access
        </Button>
        <div className="w-full">
          <img
            src={dashboardDesign}
            alt="Dashboard Design"
            className="hidden md:inline-block w-full h-[70%] absolute -bottom-100"
          />
        </div>
      </div>

      <div
        className="relative flex md:flex-row items-center justify-between gap-12 py-6 md:py-20 px-8 md:px-24 my-0 md:my-8 w-full h-dvh text-justify overflow-hidden"
        ref={featuresRef}
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 left-1/3 w-[400px] h-[400px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 rounded-full blur-[100px] animate-spin-slow"></div>
          <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-gradient-to-r from-cyan-500 to-blue-600 opacity-40 rounded-full blur-[80px] animate-pulse"></div>
        </div>

        <div className="flex flex-col gap-6 p-4 items-center md:items-start justify-around w-full md:w-[50%] h-full">
          <div className="md:flex items-start gap-3">
            <img
              src={clock}
              alt=""
              className="hidden md:inline-block p-1 w-10"
            />
            <p className="md:text-2xl text-xl leading-relaxed text-gray-800">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold">
                Save time:
              </span>{" "}
              GradrAI automates tedious grading tasks, freeing up several hours
              for educators and allowing them to focus on what matters
              most—teaching, mentoring, and fostering innovation.
            </p>
          </div>

          <div className="md:flex items-start gap-3">
            <img
              src={chart}
              alt=""
              className="hidden md:inline-block p-1 w-10"
            />
            <p className="md:text-2xl text-xl leading-relaxed text-gray-800">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold">
                Enhance efficiency:
              </span>{" "}
              GradrAI uses state-of-the-art Artificial Intelligence technology
              to ensure maximum and measurable accuracy devoid of all biases.
            </p>
          </div>

          <div className="md:flex items-start gap-3">
            <img
              src={notes}
              alt=""
              className="hidden md:inline-block p-1 w-10"
            />
            <p className="md:text-2xl text-xl leading-relaxed text-gray-800">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold">
                Enhance learning outcomes:
              </span>{" "}
              Students are given insights into their performance in examinations
              via detailed reports highlighting their strengths and weaknesses.
            </p>
          </div>
        </div>

        <img
          src={marking}
          alt="interface for upload of marking guide"
          className="hidden md:inline-block p-2 h-[90%] rounded-lg shadow-xl bg-white/80 backdrop-blur-lg cursor-pointer hover:scale-110 duration-300 ease-in-out"
        />
      </div>

      <div
        className="relative bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 flex flex-col items-center justify-around gap-4 py-4 px-12 min-h-screen max-h-screen"
        ref={faqsRef}
      >
        <img src={lingkaran} alt="" className="absolute -top-20 left-0" />
        <div className="flex flex-col items-center justify-center text-center">
          <p
            id="faqs"
            className="font-extrabold text-4xl text-white font-fredoka"
          >
            Frequently Asked Questions
          </p>
          <p className="font-semibold text-xl text-slate-200">
            Everything you need to know about GradrAI
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full md:w-2/4">
          {faqs.map(({ heading, text }, id) => (
            <CustomDropdown
              key={id}
              heading={heading}
              text={text}
              isOpen={openIndex === id}
              onToggle={() => toggleDropdown(id)}
            />
          ))}
        </div>
        <img src={updown} alt="" className="absolute -bottom-20 -right-10" />
      </div>

      <div
        className="bg-gradient-to-l from-[#0078F9] to-[#FF66F0]  rounded-2xl flex flex-col items-center justify-between max-h-max m-4 md:my-16 md:mx-12 p-4 md:py-16 md:px-12"
        ref={gradingRef}
      >
        <p className="text-4xl md:text-5xl text-white md:w-[40%] text-center">
          Revolutionizing education with the power of AI
        </p>
        <p className="text-white text-center tracking-normal md:tracking-wider">
          Boost your productivity and improve the efficiency of your assessment
          process!
        </p>
        <Button
          className="py-6 px-4 text-lg  font-raleway bg-pink-500 hover:bg-pink-600 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.3)] duration-300 hover:shadow-[6px_6px_12px_rgba(0,0,0,0.4)]"
          onClick={() => {
            window.open(
              "mailto:support@gradrai.com?subject=Demo Request&body=Hello there, I would like to request for a demo of gradrai",
              "_blank",
              "noopener,noreferrer"
            );
          }}
        >
          Request for a Demo
        </Button>
      </div>

      <footer
        className="w-full flex items-baseline justify-between p-4"
        ref={contactRef}
      >
        <img src={logo} alt="gradr logo" className="" />

        <div className="hidden md:flex flex-wrap items-center justify-start gap-2 w-max -my-2 text-xs">
          <p className="m-0">&copy; Copyright {new Date().getFullYear()}.</p>
          <p>All rights reserved.</p>
        </div>

        <div className="flex items-center justify-end w-max gap-8">
          <Icon
            name="mail"
            size="large"
            color="blue"
            className="cursor-pointer hover:text-slate-500"
            onClick={() => {
              window.open(
                "mailto:support@gradrai.com?subject=Inquiry&body=Hello there, I would like to make an inquiry",
                "_blank",
                "noopener,noreferrer"
              );
            }}
          />
          <Icon
            name="linkedin"
            size="large"
            color="blue"
            className="cursor-pointer hover:text-slate-500"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/company/gradrai/",
                "_blank",
                "noopener,noreferrer"
              )
            }
          />
        </div>
      </footer>
    </div>
  );
};

export default Landing;
