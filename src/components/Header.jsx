const Header = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-violet-50 w-full h-[10dvh] p-6 border-b-neutral-600 flex justify-end items-center">
      <div className="flex items-center gap-2 p-4 justify-between">
        <span className="rounded-full width-[2rem] bg-neutral-800" />

        <div className="flex items-center justify-between gap-4">
          <img
            src={user?.picture}
            alt="profile"
            className="w-[35px] rounded-full"
          />
          <div className="flex flex-col items-end justify-between">
            <p className="font-semibold">{`${user?.first_name} ${user?.last_name}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
