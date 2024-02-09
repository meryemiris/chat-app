import { supabase } from "@/lib/supabase";
import styles from "./Login.module.css";
import { useRouter } from "next/router";
import { useState } from "react";
import { IoLogoGithub, IoLogoGoogle } from "react-icons/io5";
import Alert, { alertMessage } from "./Alert";
import Loading from "./Loading";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [alert, setAlert] = useState<alertMessage | null>(null);

  const showAlert = (type: string, title: string, message: string) => {
    setAlert({ title, message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        showAlert(
          "warning",
          "Hey there!",
          "Please fill in both email and password before signing in."
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          showAlert(
            "error",
            "Oops!",
            "User not found or incorrect password. Please double-check your credentials."
          );
        } else {
          showAlert(
            "error",
            "Uh-oh!",
            "Something went wrong while signing in. Please try again later."
          );
        }
      } else {
        showAlert("success", "Welcome back!", "You've signed in successfully.");

        router.push("/");
      }
    } catch (error) {
      showAlert(
        "error",
        "Uh-oh!",
        "Something unexpected happened. Please try again later."
      );
    } finally {
      setEmail("");
      setPassword("");
    }
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
    </>
  );
}
