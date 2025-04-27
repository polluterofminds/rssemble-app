import { Post, BlogSource } from "./types";

export const feedData: Post[] = [
  {
    id: "1",
    title: "The Future of Web Development: What to Expect in 2025",
    author: "Sarah Johnson",
    sourceName: "TechCrunch",
    date: "2h ago",
    excerpt:
      "As we approach 2025, web development continues to evolve at a rapid pace. This article explores the emerging trends, technologies, and methodologies that will define the industry in the coming years.",
    url: "#article-1",
    category: "Technology",
    isBookmarked: true,
    isStarred: false,
  },
  {
    id: "2",
    title:
      "React 19 Release Candidate: New Features and Performance Improvements",
    author: "David Chen",
    sourceName: "React Blog",
    date: "4h ago",
    excerpt:
      "The React team has announced the release candidate for React 19, bringing significant performance improvements and exciting new features. Let's dive into what's new and how it will impact your development workflow.",
    url: "#article-2",
    category: "React",
    isBookmarked: false,
    isStarred: true,
  },
  {
    id: "3",
    title: "Mastering CSS Grid: Advanced Layout Techniques",
    author: "Emily Rodriguez",
    sourceName: "CSS-Tricks",
    date: "1d ago",
    excerpt:
      "CSS Grid has revolutionized how we approach web layouts. In this comprehensive guide, we'll explore advanced grid techniques that will take your designs to the next level.",
    url: "#article-3",
    category: "CSS",
    isBookmarked: false,
    isStarred: false,
  },
  {
    id: "4",
    title: "Building Performant Web Applications with Next.js",
    author: "Michael Thompson",
    sourceName: "Vercel Blog",
    date: "2d ago",
    excerpt:
      "Performance is crucial for modern web applications. In this article, we'll explore strategies for optimizing your Next.js applications, from code splitting to server-side rendering and everything in between.",
    url: "#article-4",
    category: "Next.js",
    isBookmarked: true,
    isStarred: true,
  },
  {
    id: "5",
    title: "The State of JavaScript in 2025: Trends, Tools, and Technologies",
    author: "Alex Mercer",
    sourceName: "JavaScript Weekly",
    date: "3d ago",
    excerpt:
      "JavaScript continues to dominate the web development landscape. This article examines the current state of the ecosystem, popular tools, and emerging patterns that are shaping the future of JavaScript development.",
    url: "#article-5",
    category: "JavaScript",
    isBookmarked: false,
    isStarred: false,
  },
];

export const blogSources: BlogSource[] = [
  {
    id: "1",
    name: "TechCrunch",
    url: "https://techcrunch.com/feed",
    postCount: 158,
  },
  {
    id: "2",
    name: "React Blog",
    url: "https://reactjs.org/feed.xml",
    postCount: 43,
  },
  {
    id: "3",
    name: "CSS-Tricks",
    url: "https://css-tricks.com/feed",
    postCount: 209,
  },
  {
    id: "4",
    name: "Vercel Blog",
    url: "https://vercel.com/blog/feed.xml",
    postCount: 27,
  },
  {
    id: "5",
    name: "JavaScript Weekly",
    url: "https://javascriptweekly.com/rss",
    postCount: 172,
  },
];
