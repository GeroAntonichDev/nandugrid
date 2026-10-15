export interface UserLink {
  label: string;
  url: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  links: UserLink[];
}
