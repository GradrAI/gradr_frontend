import { useEffect, useState } from "react";
import initialUserState from "@/data/initialUserState";

const Header = () => {
  const [currentUser, setCurrentUser] = useState({});

  const user = localStorage.getItem("user");
  let parsedUser = initialUserState;
  if (user) parsedUser = JSON.parse(user);
  useEffect(() => {
    if (parsedUser) setCurrentUser(parsedUser);
  }, [parsedUser]);

  return (
    <div className="bg-violet-50 w-full h-[10dvh] p-6 border-b-neutral-600 flex justify-end items-center">
      <div className="flex items-center gap-2 p-4 justify-between">
        <span className="rounded-full width-[2rem] bg-neutral-800" />

        {!currentUser && (
          <div className="flex items-center justify-between gap-4">
            <img
              src={currentUser?.picture}
              alt="profile"
              className="w-[35px] rounded-full"
            />
            <div className="flex flex-col items-end justify-between">
              <p className="font-semibold">{`${currentUser?.first_name} ${currentUser?.last_name}`}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
