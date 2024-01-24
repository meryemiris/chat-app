import Image from "next/image";
import styles from "./RoomDetails.module.css";

export default function RoomDetails() {
  return (
    <div className={styles.container}>
      <h3>Room Details</h3>
      <p>Created at</p>
      <h6>Members</h6>
    </div>
  );
}
