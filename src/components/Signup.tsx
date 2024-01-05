import { useState } from "react";
import { supabase } from "../lib/supabase";

import styles from "./Login.module.css";
import { useRouter } from "next/router";

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
            .insert([{ username: username, id: user.id }])
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
  return (
    <div className={styles.container}>
      <form onSubmit={handleRegister} className={styles.login}>
        <label className={styles.label} htmlFor="email">
          email
        </label>
        <input
          className={styles.input}
          type="email"
          id="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />

        <label className={styles.label} htmlFor="username">
          username
        </label>
        <input
          className={styles.input}
          type="text"
          id="username"
          onChange={(e) => setUsername(e.currentTarget.value)}
          required
        />
        <label className={styles.label} htmlFor="password">
          password
        </label>
        <input
          className={styles.input}
          type="password"
          id="password"
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
        />
        <button className={styles.button}>Signup</button>

        <p className={styles.text}>
          Already have an account?
          <a className={styles.link} href="login">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
