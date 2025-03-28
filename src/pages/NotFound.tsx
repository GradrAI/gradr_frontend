import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const nav = useNavigate();

  return (
    <div className="bg-gray-200 w-full h-dvh flex flex-col items-center justify-center gap-16">
      <h1 className="tracking-widest leading-loose">Page Not Found</h1>
      <Button onClick={() => nav("/")} className="text-lg py-6 px-8">
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;
