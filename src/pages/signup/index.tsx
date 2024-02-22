import Signup from "@/components/auth/Signup";
import Image from "next/image";
import styles from "@/styles/Login-SignupPages.module.css";

const signupImg = "/mushroom.svg";

export default function SignupPage() {
  return (
    <div className={styles.container}>
      <Image
        src={signupImg}
        className={styles.image}
        width={50}
        height={50}
        alt="signup"
      />
      <Signup />
    </div>
  );
}
