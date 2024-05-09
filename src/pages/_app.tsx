import { AuthProvider } from "@/lib/AuthContext";
import { ChatProvider } from "@/lib/ChatContext";
import { UserProvider } from "@/lib/UserContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<AuthProvider>
			<UserProvider>
				<ChatProvider>
					<Toaster
						expand
						position="top-right"
						richColors
						pauseWhenPageIsHidden
					/>
					<Component {...pageProps} />
				</ChatProvider>
			</UserProvider>
		</AuthProvider>
	);
}
