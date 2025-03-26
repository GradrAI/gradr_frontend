import { Icon } from "semantic-ui-react";

const CustomDropdown = ({ heading, text, isOpen, onToggle }) => {
  return (
    <div className="bg-slate-200 rounded-2xl flex flex-col items-center justify-start gap-4 p-6 md:p-8">
      <div className="w-full flex items-center justify-between">
        <p className="m-0 font-semibold text-lg text-teal-800 font-sans">
          {heading}
        </p>
        <Icon
          name="plus"
          className="hover:cursor-pointer hover:text-slate-600"
          onClick={onToggle}
        />
      </div>
      {isOpen && <p className="text-slate-800 self-start">{text}</p>}
    </div>
  );
};

export default CustomDropdown;
