// pages/login.tsx
import { ReactElement } from "react";
import Login from "@/components/auth/Login";
import AuthLayout from "@/components/layout/AuthLayout";
import type { NextPageWithLayout } from "@/types";

const LoginPage: NextPageWithLayout = () => {
	return <Login />;
};

LoginPage.getLayout = function getLayout(page: ReactElement) {
	return (
		<AuthLayout header="Welcome!" subheader="Ready to Sign In?">
			{page}
		</AuthLayout>
	);
};

export default LoginPage;
