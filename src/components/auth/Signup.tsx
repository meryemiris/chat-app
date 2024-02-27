import { useState } from "react";
import { supabase } from "../../lib/supabase";

import styles from "./Login.module.css";
import { IoLogoGithub, IoLogoGoogle } from "react-icons/io5";

import Alert, { alertMessage } from "../utils/Alert";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [alert, setAlert] = useState<alertMessage | null>(null);

  const showAlert = (type: string, title: string, message: string) => {
    setAlert({ title, message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const usernameCheck = await supabase
      .from("users")
      .select("username")
      .eq("username", username);

    console.log("usernameCheck:", usernameCheck);

    const emailCheck = await supabase
      .from("users")
      .select("email")
      .eq("email", email);

    try {
      if (!email || !password || !username) {
        showAlert(
          "warning",
          "Hey there!",
          "Please fill in both email and password before signing in."
        );
        return;
      }

      if (emailCheck.data && emailCheck.data.length > 0) {
        showAlert(
          "warning",
          "Hey there!",
          "There is already an account with this email. Please login instead."
        );
        return;
      }
      if (usernameCheck.data && usernameCheck.data.length > 0) {
        showAlert(
          "warning",
          "Hey there!",
          "Username already taken. Please choose another one."
        );
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showAlert(
          "warning",
          "Hey there!",
          "Please enter a valid email address."
        );
        return;
      }

      if (password.length < 6) {
        showAlert(
          "warning",
          "Hey there!",
          "Please enter a valid password (at least 6 characters)."
        );
        return;
      }

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
            .insert([
              {
                id: user.id,
                username: username,
                email: email,
                profile_img: "",
              },
            ])
            .select();

          if (insertError) {
            console.log("Error inserting user:", insertError);
          } else console.log("User inserted successfully:", data);
        }
      }
      showAlert(
        "success",
        "Welcome to Mushroom! 🍄",
        `\nPlease check your email (${email}) and confirm your account. `
      );
    } catch (error) {
      console.error("Error registering user:", error);
      showAlert("error", "Error", "Error registering user. Please try again.");
    } finally {
      setEmail("");
      setPassword("");
      setUsername("");
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
    <>
      {alert && (
        <Alert
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <form onSubmit={handleRegister} className={styles.form}>
        <h1>Start Now!</h1>
        <h2>Join for Free.</h2>
        <div className={styles.inputGroup}>
          <input
            value={email}
            className={styles.input}
            type="email"
            id="email"
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <label className={styles.userLabel} htmlFor="email">
            Email
          </label>
        </div>

        <div className={styles.inputGroup}>
          <input
            value={username}
            className={styles.input}
            type="text"
            id="username"
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <label className={styles.userLabel} htmlFor="username">
            Username
          </label>
        </div>
        <div className={styles.inputGroup}>
          <input
            value={password}
            className={styles.input}
            type="password"
            id="password"
            onChange={(e) => setPassword(e.currentTarget.value)}
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
    </>
  );
}
