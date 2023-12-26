import { supabase } from "@/lib/supabase";
import styles from "./Login.module.css";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error signing in:", error.message);
      } else {
        console.log("User signed in successfully:", user);

        router.push("/");
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <form
      className={styles.login}
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <label className={styles.label} htmlFor="email">
        email
      </label>
      <input
        className={styles.input}
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
        type="text"
        id="email"
      />
      <label className={styles.label} htmlFor="password">
        password
      </label>
      <input
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        id="password"
      />
      <button className={styles.button} type="submit">
        Login
      </button>

      <p className={styles.text}>
        Do not have an account?{" "}
        <a className={styles.link} href="signup">
          Signup
        </a>
      </p>
    </form>
  );
}
