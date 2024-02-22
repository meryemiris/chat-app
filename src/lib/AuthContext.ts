import { createContext } from "react";

const AuthContext = createContext({
  userId: "",
  setUserId: (id: string) => {},

  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn: boolean) => {},
});

export default AuthContext;
