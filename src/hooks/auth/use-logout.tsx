import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

import { useUI } from "@/contexts/use-ui";

interface LogoutResponse {
  message: string;
  ok: boolean;
}

async function logout(): Promise<LogoutResponse> {
  return {
    message: "Logout Successful!",
    ok: true,
  };
}

export const useLogoutMutation = () => {
  const { unauthorize } = useUI(); // Ensure this function is defined in useUI

  return useMutation<LogoutResponse, Error>({
    mutationFn: logout,
    onError: (error) => {
      console.error("Logout error response:", error.message);
    },
    onSuccess: () => {
      Cookies.remove("auth_token");
      unauthorize();
    },
  });
};
