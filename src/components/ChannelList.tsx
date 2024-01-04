import { Channel } from "./Sidebar";
import styles from "./ChannelList.module.css";

type ChannelListProps = {
  handleChannelChange: (id: number, name: string) => void;
  handleCreateChannel: (e: React.FormEvent<HTMLFormElement>) => void;
  searchTerm: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;

  channels: Channel[];
};
const ChannelList: React.FC<ChannelListProps> = ({
  handleChannelChange,
  handleCreateChannel,
  searchTerm,
  handleSearch,

  channels,
}) => {
  return (
    <div className={styles.channelContainer}>
      <h2 className={styles.channelTitle}>Channels</h2>
      <form onSubmit={handleCreateChannel}>
        <input
          className={styles.channelInput}
          name="channelName"
          placeholder="Search or create a new channel"
          value={searchTerm}
          onChange={handleSearch}
          autoFocus={channels.length === 0 ? true : false}
        />
      </form>

      {channels.map(({ id, name }) => (
        <button
          onClick={() => handleChannelChange(id, name)}
          key={id}
          className={styles.channelButton}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default ChannelList;
