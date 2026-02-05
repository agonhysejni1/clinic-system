import axios from "./axios";

export const getMe = async () => {
  const res = await axios.get("/users/me");
  return res.data;
};
