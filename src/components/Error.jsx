import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Error = () => {
  const nav = useNavigate();

  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center gap-4">
      <p className="text-xl">Something went wrong</p>
      <Button
        onClick={() => {
          nav("/app");
          window.location.reload();
        }}
        size="lg"
      >
        Go back
      </Button>
    </div>
  );
};

export default Error;
