import React, { createContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useRouter } from "next/router";

export type AuthContextType = {
	userId: string;
	setUserId: (userId: string) => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const router = useRouter();
	const [userId, setUserId] = useState<string>("");

	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			setUserId(session?.user?.id || "");

			if (
				!session &&
				router.pathname !== "/login" &&
				router.pathname !== "/signup"
			) {
				router.push("/login");
			}
		});

		return data.subscription.unsubscribe;
	}, [router]);

	const value = { userId, setUserId };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext() {
	const context = React.useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuthContext must be used within a AuthContextProvider");
	}

	return context;
}
