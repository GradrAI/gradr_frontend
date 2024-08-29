import { useNavigate } from "react-router-dom";
import { Button, Icon, Image } from "semantic-ui-react";
import { dashboardDesign, stroke, logo } from "../assets";
import { faqs, users } from "../requests/constants";
import CustomDropdown from "../components/CustomDropdown";
import Card from "../components/Card";
import "./customMask.css";

const NewLanding = () => {
  const nav = useNavigate();

  return (
    <div className="">
      <header className="w-full flex items-center justify-between py-4 px-12">
        <img src={logo} alt="gradr logo" />

        <div className="hidden md:flex items-center justify-between gap-8 w-2/4">
          <p className="m-0 text-blue-400 cursor-pointer hover:text-blue-600">
            Features
          </p>
          <p
            className="m-0 text-blue-400 cursor-pointer hover:text-blue-600"
            onClick={() => nav("#faqs")}
          >
            FAQs
          </p>
          <p className="m-0 text-blue-400 cursor-pointer hover:text-blue-600">
            Pricing
          </p>
          <p className="m-0 text-blue-400 cursor-pointer hover:text-blue-600">
            Contact
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="m-0 text-blue-400">Book a Demo</p>
          <Button size="small" primary onClick={() => nav("/signup")}>
            Sign up
          </Button>
        </div>
      </header>

      <div className="flex flex-col items-center justify-start gap-16 py-8 w-full min-h-max max-h-[100dvh]">
        <div className="flex items-center justify-center relative w-full pt-16">
          <img src={stroke} className="-z-9 absolute" />
          <h1 className="text-7xl text-center text-blue-400 w-[40%] z-9">
            Break Free From Manual Marking
          </h1>
        </div>
        <h2 className="text-2xl text-blue-400 font-light tracking-widest drop-shadow-lg">
          Save hours of tedious grading time and focus more on what matters most
          - teaching!
        </h2>
        <Button primary size="large" className="py-14">
          Register for early access
        </Button>
      </div>

      <div className="bg-gradient-to-r from-blue-300 to-violet-300 via-purple-300 w-full h-[100vh] flex items-center justify-center customMask">
        <Image size="huge" src={dashboardDesign} alt="Dashboard Design" />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-12 py-12 px-12">
        <div className="flex flex-col items-start justify-start gap-8 md:w-2/4">
          <p className="text-4xl">Reduce grading time up to 90%</p>
          <p className="text-2xl">
            Gradr AI automates tedious grading tasks, freeing up 20,000+ hours
            for educators to focus on what matters most - teaching, mentoring,
            and innovation. This means more support for students and a more
            engaging learning experience.
          </p>
        </div>

        <div className="hidden md:block bg-[#E3F1FF] md:w-2/4 h-[50dvh] rounded-xl">
          <img />
        </div>
      </div>

      <div className="flex justify-between gap-12 py-12 px-12">
        <div className="bg-[#FFDEC7] w-2/4 h-[50dvh] rounded-xl">
          <img />
        </div>

        <div className="flex flex-col items-start justify-start gap-4 md:w-2/4">
          <p className="text-4xl">Get Real-time Analysis from Student Grades</p>
          <p className="text-2xl text-slate-600">
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet? Ut
            enim ad minima veniam, quis nostrum exercitationem ullam.
          </p>
          <div className="flex flex-col text-xl text-slate-400">
            <p>Lorem ipsum dolor sit amet</p>
            <p>Consectetur adipiscing elit</p>
            <p>Sed do eiusmod tempor incididunt ut labore</p>
          </div>
          <div className="text-center flex items-center justify-center gap-2">
            <p className="m-0 text-orange-400">Learn More</p>
            <Icon name="right arrow" className="text-orange-400" />
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-12 py-12 px-12">
        <div className="flex flex-col items-start justify-start gap-8 w-2/4">
          <p className="text-4xl">Lorem Ipsum Dolor Sit Amet</p>
          <p className="text-2xl">
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet? Ut
            enim ad minima veniam, quis nostrum exercitationem ullam.
          </p>
          <div className="flex justify-between gap-6">
            <div className="flex flex-col">
              <p className="text-2xl">100+</p>
              <p className="text-xl">Lorem ipsum dolor sit</p>
            </div>
            <div className="flex flex-col">
              <p className="text-2xl">800+</p>
              <p className="text-xl">Lorem ipsum dolor sit</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F7BBCF] w-2/4 h-[50dvh] rounded-xl">
          <img />
        </div>
      </div>

      <div className="bg-[#F4F8FA] flex flex-col items-center justify-between py-8">
        <p className="text-4xl">Testimonials</p>
        <p className="w-[50%] text-center text-2xl text-slate-600">
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
          fugit, sed quia consequuntur ma. Ut enim ad minim veniam, quis nostrud
          exercitation.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-6 h-max py-8 px-10">
          {users.map((user, id) => (
            <Card key={id} user={user} />
          ))}
        </div>
      </div>

      <div className="flex items-start justify-between gap-12 py-12 px-12">
        <div className="flex flex-col items-start justify-start w-1/4">
          <p id="faqs" className="text-red-600 font-bold">
            Frequently Asked Questions
          </p>
          <p className="text-3xl font-extrabold">
            {"Let's clarify some of your questions"}
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore
          </p>
        </div>
        <div className="flex flex-col gap-6 w-2/4">
          {faqs.map(({ heading, text }, id) => (
            <CustomDropdown key={id} heading={heading} text={text} />
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-l from-[#0078F9] to-[#FF66F0]  rounded-2xl flex flex-col items-center justify-between max-h-max my-16 mx-12 py-16 px-12">
        <p className="text-5xl text-white w-[40%] text-center">
          Revolutionizing Education with the power of AI
        </p>
        <p className="text-white tracking-wider">
          Join over 800+ happy teachers boosting productivity and efficiency!
        </p>
        <Button primary>Request for a Demo</Button>
      </div>

      <div className="flex justify-between py-16 px-12">
        <img src={logo} alt="gradr logo" />

        <div className="flex items-start justify-between w-3/4 gap-6">
          <div className="flex flex-col gap-3">
            <p className="font-semibold">Features</p>
            <p>Automated Marking</p>
            <p>Grade Analysis</p>
            <p></p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-semibold">Pricing</p>
            <p>Free Trial</p>
            <p>Personal</p>
            <p>School</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-semibold">Enterprise</p>
            <p>Personalize</p>
            <p>Automation</p>
            <p>24/7 Support</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-semibold">Careers</p>
            <p>Open Positions</p>
            <p>Part-Time</p>
            <p>Contractual</p>
          </div>
        </div>
      </div>

      <footer className="w-full flex items-center justify-between pt-12 px-12">
        <div className="flex gap-2">
          <p>&copy; Copyright {new Date().getFullYear()}.</p>
          <p>Gradr.</p>
          <p>All rights reserved.</p>
        </div>

        <div className="flex items-center justify-center gap-8">
          <Icon
            name="mail"
            size="large"
            className="cursor-pointer hover:text-slate-500"
          />
          <Icon
            name="linkedin"
            size="large"
            className="cursor-pointer hover:text-slate-500"
          />
        </div>
      </footer>
    </div>
  );
};

export default NewLanding;
