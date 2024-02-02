import Login from "@/components/Login";
import Image from "next/image";
import styles from "@/styles/Login-SignupPages.module.css";

const loginImage = "/mushroom.svg";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <Image
        className={styles.image}
        src={loginImage}
        width={100}
        height={100}
        alt="login"
      />
      <Login />
    </div>
  );
}
