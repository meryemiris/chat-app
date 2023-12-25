import styles from "./Login.module.css";

export default function Login() {
  return (
    <form className={styles.login}>
      <label className={styles.label} htmlFor="username">
        username
      </label>
      <input className={styles.input} type="text" id="username" />
      <label className={styles.label} htmlFor="password">
        password
      </label>
      <input className={styles.input} type="password" id="password" />
      <button className={styles.button}>Login</button>

      <p className={styles.text}>
        Do not have an account?{" "}
        <a className={styles.link} href="/signup">
          Signup
        </a>
      </p>
    </form>
  );
}
