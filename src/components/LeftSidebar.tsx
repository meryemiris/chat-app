import RoomDetails from "@/components/RoomDetails";
import RoomContext from "@/lib/RoomContext";
import styles from "./LeftSidebar.module.css";
import { useContext } from "react";
import { IoClose } from "react-icons/io5";

const LeftSidebar = () => {
  const { setShowRoomDetails } = useContext(RoomContext);

  return (
    <div className={styles.wrapper}>
      <button
        onClick={() => setShowRoomDetails(false)}
        className={styles.closeButton}
      >
        <IoClose />
      </button>

      <RoomDetails />
    </div>
  );
};

export default LeftSidebar;
