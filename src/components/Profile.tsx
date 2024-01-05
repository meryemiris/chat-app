import Image from "next/image";
import styles from "./Profile.module.css";
import { TbUserEdit } from "react-icons/tb";
import { useContext, useEffect, useState } from "react";
import AuthContext from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const { username, setUsername, userId } = useContext(AuthContext);
  console.log(username);

  const [isEdit, setIsEdit] = useState(false);

  const [profileImg, setProfileImg] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("profile_img")
        .eq("auth_id", userId)
        .single();

      if (data) {
        setProfileImg(data?.profile_img);
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

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

  const updateProfilePic = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("users")
      .update({ profile_img: profileImg })
      .eq("auth_id", userId)
      .select();

    console.log("Request Payload:", { profile_img: profileImg, userId });
    console.log("Response from Supabase:", data, error);

    setIsEdit(false);
  };

  return (
    <div className={styles.profile}>
      <div className={styles.profileHeader}>
        <h2 className={styles.profileTitle}>Profile</h2>
        <button
          className={styles.editProfile}
          onClick={() => setIsEdit(!isEdit)}
        >
          <TbUserEdit />
        </button>
      </div>

      <Image
        className={styles.profileImg}
        src={profileImg}
        alt="profile image"
        width={100}
        height={100}
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
          <button className={styles.profileBtn} onClick={updateProfilePic}>
            Update
          </button>
        </form>
      )}

      <form>
        <input
          className={styles.profileInput}
          name="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
      </form>
    </div>
  );
}
