import React, { createContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuthContext } from "./AuthContext";

export type UserContextType = {
	profileImg: string;
	username: string;
	friendId: string;
	showProfile: boolean;
	setProfileImg: React.Dispatch<React.SetStateAction<string>>;
	setUsername: React.Dispatch<React.SetStateAction<string>>;
	setFriendId: React.Dispatch<React.SetStateAction<string>>;
	setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = createContext<UserContextType>({} as UserContextType);
const defaultPp = "/defaultPp.png";
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { userId } = useAuthContext();
	const [profileImg, setProfileImg] = useState(defaultPp);
	const [username, setUsername] = useState("");
	const [friendId, setFriendId] = useState("");
	const [showProfile, setShowProfile] = useState(false);

	useEffect(() => {
		async function getUser() {
			const { data: user, error: userError } = await supabase
				.from("users")
				.select("profile_img, username")
				.eq("id", userId);

			if (user) {
				console.log(user);
				setProfileImg(user[0].profile_img);
				setUsername(user[0].username);
			} else {
				console.log(userError);
			}
		}
		getUser();
	}, [userId]);

	const value = {
		profileImg,
		username,
		setProfileImg,
		setUsername,
		friendId,
		setFriendId,
		showProfile,
		setShowProfile,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUserContext() {
	const context = React.useContext(UserContext);

	if (context === undefined) {
		throw new Error("useUserContext must be used within a UserContextProvider");
	}

	return context;
}