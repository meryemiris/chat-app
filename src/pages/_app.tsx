import { AuthProvider } from "@/lib/AuthContext";
import { UserProvider } from "@/lib/UserContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<AuthProvider>
			<UserProvider>
				<Component {...pageProps} />
			</UserProvider>
		</AuthProvider>
	);
}
