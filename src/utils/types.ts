export interface Post {
  id: string;
  title: string;
  author: string;
  sourceName: string;
  date: string;
  excerpt: string;
  url: string;
  category?: string;
  isBookmarked: boolean;
  isStarred: boolean;
}

export interface BlogSource {
  id: string;
  name: string;
  url: string;
  postCount: number;
}

export type FeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type DataFeed = {
  author: string;
  fid: number;
  title: string;
  content: string;
  categories: string[];
  guid: string;
  isoDate: string;
  pubDate: string;
  link: string;
  feedInfo?: {
    title: string;
  }
};

export interface BlogInfo {
  fid: number;
  title: string;
  description: string;
  link: string;
  author: string;
  latestPostDate: string;
}

export type ValidateFeedResponse = {
  isValid: boolean;
  error?: string;
};

export type Nav = { name: string; href: string; current: boolean };
