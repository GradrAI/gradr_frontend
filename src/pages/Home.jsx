import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-full min-h-[90dvh] grid md:grid-cols-2 items-center p-6 bg-gradient-to-br from-white to-slate-50">
      <div className="hidden md:flex flex-col items-start justify-center space-y-6 px-8">
        <h1 className="text-5xl font-black text-gray-800 tracking-tight leading-tight animate-fade-in">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-shimmer">
            GradrAI
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-md animate-fade-in delay-200">
          Grade paper-based tests 10× faster using AI. Save time, reduce
          workload, and focus on what matters — teaching.
        </p>
        <div className="flex gap-4 mt-4 animate-fade-in delay-300">
          <span className="text-sm px-4 py-2 rounded-xl bg-blue-100 text-blue-700 font-medium shadow-sm">
            ✨ Get more efficient
          </span>
          <span className="text-sm px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-medium shadow-sm">
            ⏰ Save time
          </span>
          <span className="text-sm px-4 py-2 rounded-xl bg-pink-100 text-pink-700 font-medium shadow-sm">
            🚀 Grade faster
          </span>
        </div>
      </div>

      <div className="w-full h-full p-6 bg-white rounded-xl shadow-lg animate-fade-in-up">
        <Outlet />
      </div>
    </div>
  );
};

export default Home;
