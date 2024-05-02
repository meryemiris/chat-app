import { createContext } from "react";

const UserContext = createContext({
	profileImg: "",
	setProfileImg: (profilePic: string) => {},

	username: "",
	setUsername: (userName: string) => {},

	friendId: "",
	setFriendId: (friendUserId: string) => {},

	showProfile: false,
	setShowProfile: (showProfile: boolean) => {},
});

export default UserContext;
