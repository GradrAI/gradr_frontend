import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button, Form } from "semantic-ui-react";

import { BASE_URL } from "../requests/constants";
import toast from "react-hot-toast";

const Login = () => {
  const [clicked, setClicked] = useState(false);

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["Data"],
    queryFn: () => axios.get(`${BASE_URL}/auth/google`),
    enabled: clicked,
  });

  const handleSubmit = () => {
    setClicked(true);
  };

  useEffect(() => {
    if (isLoading) {
      toast.success("Signing you in...");
    }
    if (isError) {
      toast.error(error);
    }
    if (data) {
      window.location.href = data?.data?.authorizationUrl;
    }
  }, [isLoading, isError, error, data]);

  return (
    <Form
      onSubmit={handleSubmit}
      className="w-full h-full flex flex-col items-center justify-center"
    >
      <Button primary type="submit">
        Sign in with Google
      </Button>
    </Form>
  );
};

export default Login;
