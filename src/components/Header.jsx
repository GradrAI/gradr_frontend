import useStore from "@/state";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const { user } = useStore();

  return (
    <header className="bg-background/80 backdrop-blur-md w-full h-16 px-6 border-b border-border flex justify-between items-center sticky top-0 z-50 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" />
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {!!user && (
          <div className="flex items-center gap-3 pl-3 border-l border-border h-8">
            {user?.picture && (
              <img
                src={user.picture}
                alt="profile"
                className="w-8 h-8 rounded-full border border-border"
              />
            )}
            <div className="hidden sm:flex flex-col items-start justify-center">
              <p className="font-semibold text-sm text-foreground leading-tight">{`${user?.first_name} ${user?.last_name}`}</p>
              <p className="text-[10px] text-muted-foreground capitalize leading-none mt-0.5">{user?.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
