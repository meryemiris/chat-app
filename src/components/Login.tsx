import { supabase } from "@/lib/supabase";
import styles from "./Login.module.css";
import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import { IoLogoGithub, IoLogoGoogle } from "react-icons/io5";

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
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <h1>Welcome!</h1>
      <h2>Ready to Sign In?</h2>
      <div className={styles.inputGroup}>
        <input
          id="email"
          type="text"
          name="email"
          autoComplete="off"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className={styles.userLabel} htmlFor="email">
          Email
        </label>
      </div>
      <div className={styles.inputGroup}>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="off"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className={styles.userLabel} htmlFor="password">
          Password
        </label>
      </div>
      <p className={styles.forgotPassword}>Forgot password?</p>
      <button className={styles.button} type="submit">
        Login
      </button>
      <div className={styles.socialLogin}>
        <i>OR</i>
        {/* "need external OAuth providers credentials, since this is not real project I did not pay :)" */}
        <div className={styles.socialButtons}>
          <button
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
          >
            <IoLogoGoogle />
          </button>
          <button
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "github" })
            }
          >
            <IoLogoGithub />
          </button>
        </div>
      </div>
      <div className={styles.link}>
        <i>No account?</i>
        <a href="signup">Signup</a>
      </div>
    </form>
  );
}
