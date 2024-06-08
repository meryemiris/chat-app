import Head from "next/head";
import Layout from "@/components/layout/Layout";
import ChatRoomList from "@/components/chatRoomList/ChatRoomList";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "@/types";

const HomePage: NextPageWithLayout = () => {
	return (
		<>
			<Head>
				<title>Chat App</title>
				<meta name="description" content="Generated by create next app" />
			</Head>
			<ChatRoomList />
		</>
	);
};

HomePage.getLayout = function getLayout(page: ReactElement) {
	return <Layout>{page}</Layout>;
};

export default HomePage;
