import Layout from "@/components/layout/Layout";
import FriendRequests from "@/components/friends/FriendsRequests";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "@/types";

const FriendsPage: NextPageWithLayout = () => {
	return <FriendRequests />;
};

FriendsPage.getLayout = function getLayout(page: ReactElement) {
	return <Layout>{page}</Layout>;
};

export default FriendsPage;
