import { createContext } from "react";

const AuthContext = createContext({
  username: "",
  setUsername: (name: string) => {},

  profilePic: "",
  setProfilePic: (pic: string) => {},
});

export default AuthContext;
