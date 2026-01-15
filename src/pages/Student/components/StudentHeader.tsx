import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "@/types/User";
import { useNavigate } from "react-router-dom";

interface StudentHeaderProps {
  user: User;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ user }) => {
  const nav = useNavigate();

  return (
    <header className="bg-stone-200 py-2 px-6 flex justify-between items-center">
      <SidebarTrigger className="text-gray-600" />

      <h1
        onClick={() => nav("/")}
        className="m-0 font-bold text-2xl md:text-4xl"
      >
        GradrAI for students
      </h1>
      {!!user && (
        <div className="flex items-center justify-between gap-4">
          {user?.picture && (
            <img
              src={user.picture}
              alt="profile"
              className="w-[35px] rounded-full"
            />
          )}
          <div className="flex flex-wrap flex-col items-end justify-between text-white hidden md:block">
            <p className="font-semibold text-slate-600">{`${user?.first_name} ${user?.last_name}`}</p>
          </div>
        </div>
      )}
    </header>
  );
};

export default StudentHeader;
