// pages/signup.tsx
import { ReactElement } from "react";
import Signup from "@/components/auth/Signup";
import AuthLayout from "@/components/layout/AuthLayout";
import type { NextPageWithLayout } from "@/types";

const SignupPage: NextPageWithLayout = () => {
	return <Signup />;
};

SignupPage.getLayout = function getLayout(page: ReactElement) {
	return (
		<AuthLayout header="Sign Up" subheader="Join for free!">
			{page}
		</AuthLayout>
	);
};

export default SignupPage;
