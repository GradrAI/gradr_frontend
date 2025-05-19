import useStore from "@/state";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Header = () => {
  const { user } = useStore();

  return (
    <div className="bg-gray-600 w-full h-[10dvh] p-6 border-b-neutral-600 flex justify-between items-center">
      <SidebarTrigger />

      <div className="flex items-center gap-2 p-4 justify-between">
        <span className="rounded-full width-[2rem] bg-neutral-800" />
        {!!user && (
          <div className="flex items-center justify-between gap-4">
            {user?.picture && (
              <img
                src={user.picture}
                alt="profile"
                className="w-[35px] rounded-full"
              />
            )}
            <div className="flex flex-wrap flex-col items-end justify-between text-white">
              <p className="font-semibold">{`${user?.first_name} ${user?.last_name}`}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
