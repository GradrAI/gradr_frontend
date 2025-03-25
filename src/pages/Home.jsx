import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-full h-[90dvh] flex justify-center items-center gap-4">
      <div className="w-2/4 flex flex-col justify-center items-center relative">
        <p className="rounded-3xl py-4 px-8 bg-white border border-sky-600 text-sky-600 self-end z-0 absolute top-0 right-20">
          Get more efficient
        </p>
        <div className="rounded-full flex justify-center items-center bg-gradient-to-tr from-sky-500 to-stone-50 border p-4 md:p-8 w-[15rem] h-[15rem] md:w-[20rem] md:h-[20rem] z-10">
          <p className="text-white font-extrabold text-9xl not-italic">G</p>
        </div>
        <p className="text-black rounded-3xl py-4 px-8 bg-gradient-to-l from-purple-300 to-neutral-300 border border-stone-100 self-end z-0 absolute bottom-14 left-20">
          Save Time
        </p>
        <p className="text-white rounded-3xl py-4 px-8 bg-sky-600 self-end z-0 absolute bottom-0 right-40">
          Grade faster
        </p>
      </div>

      <Outlet />
    </div>
  );
};

export default Home;
