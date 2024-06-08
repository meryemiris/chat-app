import Layout from "@/components/layout/Layout";
import Profile from "@/components/profile/Profile";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "@/types";

const ProfilePage: NextPageWithLayout = () => {
	return <Profile />;
};

ProfilePage.getLayout = function getLayout(page: ReactElement) {
	return <Layout>{page}</Layout>;
};

export default ProfilePage;
