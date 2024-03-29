import Image from "next/image";
import styles from "./Profile.module.css";
import { TbUserEdit } from "react-icons/tb";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { IoLogOut } from "react-icons/io5";
import { useRouter } from "next/router";
import { MdEdit } from "react-icons/md";
import UserContext from "@/lib/UserContext";
import { AiOutlineCopy } from "react-icons/ai";

export default function Profile() {
  const { userId } = useContext(AuthContext);

  const { profileImg, setProfileImg, username, setUsername } =
    useContext(UserContext);

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

  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(userId).then(() => setCopied(true));
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

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

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Image
          src={profileImg ? profileImg : "/defaultPp.png"}
          alt="profile image"
          width={150}
          height={150}
          layout="fixed"
          loading="lazy"
          style={{ borderRadius: "50%" }}
        />
        {isEdit && (
          <form className={styles.profileForm}>
            <input type="file" name="profilePic" onChange={handleImageChange} />
            <button onClick={updateProfileImg}>Update</button>
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

        <div className={styles.shareId}>
          <p>Share your ID! 🚀</p>
          <div className={styles.copyId}>
            <span className={styles.userId}>{userId}</span>
            <button
              className={styles.copyIdButton}
              onClick={handleCopyToClipboard}
              disabled={copied}
            >
              <AiOutlineCopy />
            </button>
          </div>
          {copied && (
            <p className={styles.copySuccess}>ID copied to clipboard! 🎉</p>
          )}
        </div>
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
