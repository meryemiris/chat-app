import { useState } from "react";
import { supabase } from "../lib/supabase";

import styles from "./Login.module.css";
import { useRouter } from "next/router";
import Image from "next/image";
import { IoLogoGithub, IoLogoGoogle } from "react-icons/io5";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (!error) {
        console.log("User registered successfully:", user);

        if (user) {
          const { data, error: insertError } = await supabase
            .from("users")
            .insert([{ username: username, id: user.id, profile_img: "" }])
            .select();

          if (insertError) {
            console.log("Error inserting user:", insertError);
          } else console.log("User inserted successfully:", data);
        }
      }
      router.push("/login");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  // "need external OAuth providers credentials, since this is not real project I did not pay :)"
  const handleSignUpWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "/",
      },
    });
  };

  const handleSignUpWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "/",
      },
    });
  };

  return (
    <form onSubmit={handleRegister} className={styles.form}>
      <h1>Start Now!</h1>
      <h2>Join for Free.</h2>
      <div className={styles.inputGroup}>
        <input
          className={styles.input}
          type="email"
          id="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />
        <label className={styles.userLabel} htmlFor="email">
          Email
        </label>
      </div>

      <div className={styles.inputGroup}>
        <input
          className={styles.input}
          type="text"
          id="username"
          onChange={(e) => setUsername(e.currentTarget.value)}
          required
        />
        <label className={styles.userLabel} htmlFor="username">
          Username
        </label>
      </div>
      <div className={styles.inputGroup}>
        <input
          className={styles.input}
          type="password"
          id="password"
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
        />
        <label className={styles.userLabel} htmlFor="password">
          Password
        </label>
      </div>
      <button className={styles.button}>Signup</button>
      <div className={styles.socialLogin}>
        <i>OR</i>
        <div className={styles.socialButtons}>
          <button type="button" onClick={handleSignUpWithGoogle}>
            <IoLogoGoogle />
          </button>
          <button type="button" onClick={handleSignUpWithGithub}>
            <IoLogoGithub />
          </button>
        </div>
      </div>

      <div className={styles.link}>
        <i>Already have an account?</i>
        <a href="login">Login</a>
      </div>
    </form>
  );
}
