import { createContext } from "react";

const AuthContext = createContext({
  username: "",
  setUsername: (name: string) => {},

  userId: "",
  setUserId: (id: string) => {},
});

export default AuthContext;
