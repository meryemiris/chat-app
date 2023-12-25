import { supabase } from "@/lib/supabase";
import styles from "./Login.module.css";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email: username,
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
      <label className={styles.label} htmlFor="username">
        username
      </label>
      <input
        className={styles.input}
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
        type="text"
        id="username"
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
