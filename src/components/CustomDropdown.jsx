import { useState } from "react";
import { Icon } from "semantic-ui-react";

const CustomDropdown = ({ heading, text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-200 rounded-2xl flex flex-col items-center justify-start gap-4 p-6 md:p-8">
      <div className="w-full flex items-center justify-between">
        <p className="m-0 font-semibold text-blue-700 font-sans">{heading}</p>
        <Icon
          name="plus"
          className="hover:cursor-pointer hover:text-slate-600"
          onClick={() => setOpen(!open)}
        />
      </div>
      {open && <p className="text-slate-800 self-start">{text}</p>}
    </div>
  );
};

export default CustomDropdown;
