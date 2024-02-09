import Image from "next/image";
import styles from "./Profile.module.css";
import { TbUserEdit } from "react-icons/tb";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { IoLogOut } from "react-icons/io5";
import { useRouter } from "next/router";
import { MdEdit } from "react-icons/md";

export default function Profile() {
  const { userId } = useContext(AuthContext);
  const [profileImg, setProfileImg] = useState("");
  const [username, setUsername] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfileImg = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("users")
      .update({ profile_img: profileImg })
      .eq("id", userId)
      .select();

    console.log("Request Payload:", { profile_img: profileImg, userId });
    console.log("Response from Supabase:", data, error);

    setIsEdit(false);
  };

  useEffect(() => {
    async function getUser() {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("profile_img, username")
        .eq("id", userId);

      if (user) {
        setProfileImg(user[0]?.profile_img);
        setUsername(user[0]?.username);
      }
    }
    getUser();
  }, [userId]);

  return (
    <div className={styles.profile}>
      <header className={styles.profileHeader}>
        <h2 className={styles.profileTitle}>Profile</h2>
        <button
          className={styles.editProfile}
          onClick={() => setIsEdit(!isEdit)}
        >
          <TbUserEdit />
        </button>
      </header>

      <main>
        <Image
          src={profileImg ? profileImg : "/defaultPp.png"}
          alt="profile image"
          width={150}
          height={150}
          layout="fixed"
          loading="lazy"
        />
        {isEdit && (
          <form>
            <input
              className={styles.profileInput}
              type="file"
              name="profilePic"
              onChange={handleImageChange}
            />
            <button className={styles.profileBtn} onClick={updateProfileImg}>
              Update
            </button>
          </form>
        )}
        <form className={styles.username}>
          <input
            className={styles.usernameInput}
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            name="username"
            value={username}
          />
          <button className={styles.editUsername}>
            <MdEdit />
          </button>
        </form>
      </main>

      <footer>
        <button
          className={styles.logout}
          onClick={() => {
            router.push("/login");
            supabase.auth.signOut();
          }}
        >
          <div className={styles.icon}>
            <IoLogOut />
          </div>

          <div className={styles.text}>Logout</div>
        </button>
      </footer>
    </div>
  );
}
