import { User } from "@/types/User";
import { useNavigate } from "react-router-dom";

interface StudentHeaderProps {
  user: User;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ user }) => {
  const nav = useNavigate();

  return (
    <header className="bg-stone-200 py-2 px-6 flex justify-between items-center">
      <h1 onClick={() => nav("/")} className="m-0">
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
            <p className="font-semibold">{`${user?.first_name} ${user?.last_name}`}</p>
          </div>
        </div>
      )}
    </header>
  );
};

export default StudentHeader;
