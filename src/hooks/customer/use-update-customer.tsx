"use client";

import { useMutation } from "@tanstack/react-query";

export interface UpdateUserType {
  addess: string;
  date: string;
  default: boolean;
  email: string;
  gender: string;
  message: string;
  phoneNumber: string;
  userName: string;
}
async function updateUser(input: UpdateUserType) {
  return input;
}
export const useUpdateUserMutation = () => {
  return useMutation({
    mutationFn: (input: UpdateUserType) => updateUser(input),
    onError: (data) => {
      console.log(data, "UpdateUser error response");
    },
    onSuccess: (data) => {
      console.log(data, "UpdateUser success response");
    },
  });
};
