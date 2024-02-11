import React from "react";
import styles from "./Alert.module.css";
import { IoCloseCircle } from "react-icons/io5";

export type alertMessage = {
  title: string;
  message: string;
  type: string;
};

type AlertProps = {
  title: string;
  message: string;
  type: string;
  onClose: () => void;
};

const Alert: React.FC<AlertProps> = ({ title, message, type, onClose }) => {
  return (
    <label>
      <input type="checkbox" className={styles.alertCheckbox} />
      <div className={`alert ${styles.alert} ${styles[type]}`}>
        <button className={styles.alertClose} onClick={onClose}>
          <IoCloseCircle />
        </button>
        <h1 className="title">{title}</h1>
        <span className={styles.alertMessage}>
          {message}
          <br className={styles.clear} />
        </span>
      </div>
    </label>
  );
};

export default Alert;
