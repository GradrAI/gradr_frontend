import { Button } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";

const Error = () => {
  const nav = useNavigate();

  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center">
      <p className="text-xl">Something went wrong</p>
      <Button
        primary
        onClick={() => {
          nav("..");
          window.location.reload();
        }}
      >
        Go back
      </Button>
    </div>
  );
};

export default Error;
