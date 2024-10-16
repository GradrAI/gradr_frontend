import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Uploads = () => {
  const nav = useNavigate();

  return (
    <div className="p-4 flex flex-col gap-4">
      <Button className="w-[150px] self-end p-4" onClick={() => nav("new")}>
        Upload new file(s)
      </Button>
      {/* //! TO-DO: display all files uploaded by the user here */}
      <div>{/* insert table of uploaded files(goten by user id) here */}</div>
    </div>
  );
};

export default Uploads;
