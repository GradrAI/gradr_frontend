import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Uploads = () => {
  const nav = useNavigate();
  const [userId, setUserId] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    if (user && user._id) {
      setUserId(user._id);
    }
  }, [user]);

  const { data } = useQuery({
    queryKey: ["uploads"],
    queryFn: async () => {
      const res = await axios.get(`/exams/${userId}`);
      return res;
    },
    enabled: Boolean(userId.length),
  });

  useEffect(() => {
    console.log("data: ", data);
  }, [data]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <Button className="w-[150px] self-end p-4" onClick={() => nav("new")}>
        Upload new file(s)
      </Button>
      {/* //! TO-DO: display all files uploaded by the user here */}
      <div></div>
    </div>
  );
};

export default Uploads;
