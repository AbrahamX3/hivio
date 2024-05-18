export type UserSession = {
  id: string;
  username: string | null;
  avatar: string | null;
  email: string;
  status: "FINISHED" | "PENDING" | "WATCHING" | "UNFINISHED";
  name: string;
};
