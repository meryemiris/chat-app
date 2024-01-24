import Signup from "@/components/Signup";
import Image from "next/image";
import styles from "@/styles/SignupPage.module.css";

const signupImg = "/signup.svg";

export default function SignupPage() {
  return (
    <div className={styles.container}>
      <Image
        src={signupImg}
        className={styles.image}
        width={500}
        height={500}
        alt="signup"
      />
      <Signup />
    </div>
  );
}
