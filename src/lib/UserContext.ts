import { createContext } from "react";

const UserContext = createContext({
  profileImg: "",
  setProfileImg: (profilePic: string) => {},

  username: "",
  setUsername: (userName: string) => {},
});

export default UserContext;
