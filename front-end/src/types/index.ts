export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Post {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  upvotes: number;
  upvotedBy: string[];
  comments: Comment[];
  createdAt: Date;
}

export type Screen = 'feed' | 'profile';
