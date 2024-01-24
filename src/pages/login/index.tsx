import Login from "@/components/Login";
import Image from "next/image";
import styles from "@/styles/LoginPage.module.css";

const loginImage = "/login.svg";

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
