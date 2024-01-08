import { createContext } from "react";

const AuthContext = createContext({
  userId: "",
  setUserId: (id: string) => {},

  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn: boolean) => {},

  profileImg: "",
  setProfileImg: (img: string) => {},
});

export default AuthContext;
