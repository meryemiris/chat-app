import React, { createContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuthContext } from "./AuthContext";
import { Message } from "@/types";

export type UnreadsContextType = {
	unreads: Message[];
	setUnreads: React.Dispatch<React.SetStateAction<Message[]>>;
	unreadsChatIds: number[];
	setUnreadsChatIds: React.Dispatch<React.SetStateAction<number[]>>;
};

const UnreadsContext = createContext<UnreadsContextType>(
	{} as UnreadsContextType
);
export const UnreadsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { userId } = useAuthContext();
	const [unreads, setUnreads] = useState<Message[]>([]);
	const [unreadsChatIds, setUnreadsChatIds] = useState<number[]>([]);

	useEffect(() => {
		async function getUnreads() {
			// const { data, error } = await supabase
		}
	}, [userId]);

	const value = {
		unreads,
		setUnreads,
		unreadsChatIds,
		setUnreadsChatIds,
	};

	return (
		<UnreadsContext.Provider value={value}>{children}</UnreadsContext.Provider>
	);
};

export function useUnreadsContext() {
	const context = React.useContext(UnreadsContext);

	if (context === undefined) {
		throw new Error(
			"useUnreadsContext must be used within a UnreadsContextProvider"
		);
	}

	return context;
}
