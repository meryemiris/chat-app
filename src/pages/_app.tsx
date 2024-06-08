import "@/styles/globals.css";

import { AuthProvider } from "@/lib/AuthContext";
import { ChatProvider } from "@/lib/ChatContext";
import { UserProvider } from "@/lib/UserContext";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { NextPageWithLayout } from "@/types";

export type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
	// Use the layout defined at the page level, if available
	const getLayout = Component.getLayout ?? ((page) => page);

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
					{getLayout(<Component {...pageProps} />)}
				</ChatProvider>
			</UserProvider>
		</AuthProvider>
	);
}

export default MyApp;
