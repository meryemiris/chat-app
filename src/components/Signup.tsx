import styles from "./Login.module.css";

export default function Signup() {
  return (
    <form className={styles.login}>
      <label className={styles.label} htmlFor="email">
        email
      </label>
      <input className={styles.input} type="email" id="email" />

      <label className={styles.label} htmlFor="username">
        username
      </label>
      <input className={styles.input} type="text" id="username" />
      <label className={styles.label} htmlFor="password">
        password
      </label>
      <input className={styles.input} type="password" id="password" />
      <button className={styles.button}>Signup</button>

      <p className={styles.text}>
        Already have an account?
        <a className={styles.link} href="/login">
          Login
        </a>
      </p>
    </form>
  );
}
