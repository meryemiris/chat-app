import { AuthProvider } from "@/lib/AuthContext";
import { UserProvider } from "@/lib/UserContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster, toast } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<AuthProvider>
			<UserProvider>
				<Toaster expand position="top-right" richColors pauseWhenPageIsHidden />
				<Component {...pageProps} />
			</UserProvider>
		</AuthProvider>
	);
}
