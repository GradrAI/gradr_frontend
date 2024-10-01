import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
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

const Landing = () => {
  const nav = useNavigate();

  const featuresRef = useRef(null);
  const faqsRef = useRef(null);
  const gradingRef = useRef(null);
  const contactRef = useRef(null);

  return (
    <div className="font-sans">
      <header className="w-full flex items-center justify-between py-4 px-4 md:px-12 bg-[#dafaf9]">
        <img src={logo} alt="gradr logo" />

        <div className="hidden md:flex items-center justify-between gap-2 w-1/4">
          <p
            className="m-0 text-blue-800 font-semibold cursor-pointer hover:text-blue-600"
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
            className="m-0 text-blue-800 font-semibold cursor-pointer hover:text-blue-600"
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
            className="m-0 text-blue-800 font-semibold cursor-pointer hover:text-blue-600"
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
            className="m-0 text-blue-800 font-semibold cursor-pointer hover:text-blue-600"
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
          <p className="m-0 text-blue-800 hover:text-blue-500 font-semibold cursor-not-allowed">
            Sign in
          </p>
          <Button
            size="small"
            primary
            disabled
            // onClick={() => nav("/app")}
            className=""
          >
            Sign up
          </Button>
        </div>
      </header>

      <div className="flex flex-col items-center justify-start gap-2 py-2 w-full h-[100dvh] bg-[#dafaf9]">
        <div className="flex items-center justify-center relative w-full pt-16">
          <h1 className="text-5xl md:text-7xl text-center text-blue-900 w-full md:w-[40%] z-9 leading-loose tracking-wide md:tracking-normal font-poppins">
            Break Free From Manual Grading
          </h1>
        </div>
        <h2 className="text-2xl text-center text-blue-400 font-normal drop-shadow-lg leading-normal p-2 w-full md:w-[35%] font-fredoka">
          Save hours of tedious grading time and focus more on what matters most
          - teaching!
        </h2>
        <Button
          primary
          size="large"
          className="font-raleway"
          onClick={() => window.open("mailto:johnfiewor@gmail.com", "_blank")}
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
        className="flex md:flex-row items-center justify-between gap-12 py-6 md:py-16 px-8 md:px-24 my-0 md:my-8 w-full h-dvh text-justify"
        ref={featuresRef}
      >
        <div className="flex flex-col gap-8 items-center md:items-start justify-around w-full md:w-[40%]">
          <div className="hidden md:flex items-start gap-2">
            <img src={clock} alt="" className="p-1" />
            <p className="text-2xl leading-normal md:leading-relaxed">
              <span className="text-blue-800 font-semibold">Save time: </span>{" "}
              Gradr AI automates tedious grading tasks, freeing up several hours
              for educators and allowing them to focus on what matters most -
              teaching, mentoring, and inspiring innovation.
            </p>
          </div>

          <div className="hidden md:flex items-start gap-2">
            <img src={chart} alt="" className="p-1" />
            <p className="text-2xl leading-normal md:leading-relaxed">
              <span className="text-blue-800 font-semibold">
                Enhance efficiency:{" "}
              </span>
              Gradr AI uses state-of-the-art Artificial Intelligence to ensure
              maximum and measurable accuracy devoid of all biases.
            </p>
          </div>

          <div className="hidden md:flex items-start gap-2">
            <img src={notes} alt="" className="p-1" />
            <p className="text-2xl leading-normal md:leading-relaxed">
              <span className="text-blue-800 font-semibold">
                Enhance learning outcomes:{" "}
              </span>
              Students are provided with insights into their performance via
              detailed reports higlighting their strengths and weaknesses.
            </p>
          </div>
        </div>

        <img
          src={marking}
          alt="interface for upload of marking guide"
          className="hidden md:inline-block p-2 bg-slate-200 h-[90%]"
        />
      </div>

      <div
        className="relative bg-blue-600 flex flex-col items-center justify-around gap-4 py-4 px-12 min-h-screen max-h-screen"
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
            Everything you need to know about Gradr
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full md:w-2/4">
          {faqs.map(({ heading, text }, id) => (
            <CustomDropdown key={id} heading={heading} text={text} />
          ))}
        </div>
        <img src={updown} alt="" className="absolute -bottom-20 -right-10" />
      </div>

      <div
        className="bg-gradient-to-l from-[#0078F9] to-[#FF66F0]  rounded-2xl flex flex-col items-center justify-between max-h-max m-4 md:my-16 md:mx-12 p-4 md:py-16 md:px-12"
        ref={gradingRef}
      >
        <p className="text-4xl md:text-5xl text-white md:w-[40%] text-center">
          Revolutionizing Education with the power of AI
        </p>
        <p className="text-white text-center tracking-normal md:tracking-wider">
          Boost your productivity and improve the efficiency of your assessment
          process!
        </p>
        <Button
          primary
          onClick={() =>
            window.open(
              "https://www.linkedin.com/in/john-fiewor-365484127/",
              "_blank"
            )
          }
        >
          Request for a Demo
        </Button>
      </div>

      <div className="flex justify-between p-2 md:px-12">
        <img src={logo} alt="gradr logo" />
      </div>

      <footer
        className="w-full flex items-center justify-between p-4 md:pt-12 md:px-12"
        ref={contactRef}
      >
        <div className="hidden md:flex flex-wrap items-center justify-start gap-2 w-full">
          <p className="m-0">&copy; Copyright {new Date().getFullYear()}.</p>
          <p>All rights reserved.</p>
        </div>

        <div className="flex items-center justify-end w-full my-4 gap-8">
          <Icon
            name="mail"
            size="large"
            color="blue"
            className="cursor-pointer hover:text-slate-500"
            onClick={() => {
              window.open("mailto:johnfiewor@gmail.com", "_blank");
            }}
          />
          <Icon
            name="linkedin"
            size="large"
            color="blue"
            className="cursor-pointer hover:text-slate-500"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/in/john-fiewor-365484127/",
                "_blank"
              )
            }
          />
        </div>
      </footer>
    </div>
  );
};

export default Landing;
