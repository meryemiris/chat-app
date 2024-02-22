import { AiFillNotification } from "react-icons/ai";
import styles from "./FriendsRequests.module.css";
import { useRef, useState } from "react";
import Image from "next/image";

const FriendRequests = () => {
  // const dropdownRef = useRef<HTMLDivElement>(null);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleToggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <div className={`${styles.kebabMenu} ${styles.showRight}`}>
      <button className={styles.threeDots} onClick={handleToggleDropdown}>
        <AiFillNotification />
      </button>
      <div
        id="dropdown"
        className={`${styles.dropdown} ${dropdownVisible ? styles.show : ""}`}
      >
        <div>
          <h6>Room Requests</h6>
        </div>
        <div className={styles.request}>
          <div className={styles.requestInfo}>
            <Image
              src="/defaultPp.png"
              width={20}
              height={20}
              alt="profile picture"
            />
            <span> meryem invited you to</span>
            <div className={styles.roomName}>
              buralara yaz günü kar yağıyor canım
            </div>
          </div>
          <div className={styles.requestButtons}>
            <button className={styles.acceptButton}>Accept</button>
            <button className={styles.declineButton}>Decline</button>
          </div>
        </div>
        <div className={styles.request}>
          <div className={styles.requestInfo}>
            <Image
              src="/defaultPp.png"
              width={20}
              height={20}
              alt="profile picture"
            />
            <span> meryem invited you to</span>
            <div className={styles.roomName}>
              buralara yaz günü kar yağıyor canım
            </div>
          </div>
          <div className={styles.requestButtons}>
            <button className={styles.acceptButton}>Accept</button>
            <button className={styles.declineButton}>Decline</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;
