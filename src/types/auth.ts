export type UserSession = {
  id: string;
  username: string | null;
  avatar: string | null;
  email: string;
  status: "FINISHED" | "UPCOMING" | "PENDING" | "WATCHING" | "UNFINISHED";
  name: string;
};
