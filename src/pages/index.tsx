import styles from "@/styles/Home.module.css";
import { IoSend } from "react-icons/io5";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.chatBox}>
        <div className={styles.messageBox}>
          <p className={styles.username}>me</p>
          <p className={styles.content}>Hi, what are you doing?</p>
        </div>
        <div className={styles.messageBox}>
          <p className={styles.username}>you</p>
          <p className={styles.content}>
            I am coding, what about you? Are you gonna go to the gym today?
          </p>
        </div>
      </div>

      <form className={styles.sendBox}>
        <input type="text" placeholder="Type something..." name="message" />
        <button>
          <IoSend />
        </button>
      </form>
    </main>
  );
}
