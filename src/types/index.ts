export type Channel = {
  id: number;
  name: string;
  member_id: string[];
};

export type Message = {
  id: number;
  content: string;
  created_at: string;
  channel_id: number;
  user_id: string;
  users: {
    username: string;
    profile_img: string;
  };
};
