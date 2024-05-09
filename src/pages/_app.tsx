import { AuthProvider } from "@/lib/AuthContext";
import { UnreadsProvider } from "@/lib/UnreadsContext";
import { UserProvider } from "@/lib/UserContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<AuthProvider>
			<UserProvider>
				<UnreadsProvider>
					<Toaster
						expand
						position="top-right"
						richColors
						pauseWhenPageIsHidden
					/>
					<Component {...pageProps} />
				</UnreadsProvider>
			</UserProvider>
		</AuthProvider>
	);
}
