import { useState, useEffect } from "react";
import { BlogInfo } from "../utils/types";

interface UseGetBlogsResult {
  blogs: BlogInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// IndexedDB setup function (reuse from previous hook)
function setupIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FeedsDatabase', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('feeds')) {
        const store = db.createObjectStore('feeds', { keyPath: 'guid' });
        store.createIndex('fid', 'fid', { unique: false });
        store.createIndex('isoDate', 'isoDate', { unique: false });
        store.createIndex('author', 'author', { unique: false });
      }
      
      // Add a new object store for blog info if it doesn't exist
      if (!db.objectStoreNames.contains('blogs')) {
        const blogsStore = db.createObjectStore('blogs', { keyPath: 'fid' });
        blogsStore.createIndex('author', 'author', { unique: false });
      }
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
}

// Function to store blog information
async function storeBlogs(blogs: BlogInfo[]): Promise<number> {
  return setupIndexedDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['blogs'], 'readwrite');
      const store = transaction.objectStore('blogs');
      
      let completed = 0;
      
      transaction.oncomplete = () => {
        resolve(completed);
      };
      
      transaction.onerror = () => {
        console.error('Transaction error:', transaction.error);
        reject(transaction.error);
      };
      
      blogs.forEach(blog => {
        const request = store.put(blog);
        request.onsuccess = () => {
          completed++;
        };
      });
    });
  });
}

// Function to get all blogs from IndexedDB
async function getBlogs(): Promise<BlogInfo[]> {
  return setupIndexedDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['blogs'], 'readonly');
      const store = transaction.objectStore('blogs');
      
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const blogs = (event.target as IDBRequest<BlogInfo[]>).result;
        resolve(blogs);
      };
      
      request.onerror = (event) => {
        console.error('Request error:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  });
}

// Function to extract blog info from feed data
function extractBlogInfo(data: any[]): BlogInfo[] {
  const blogMap = new Map<number, BlogInfo>();
  
  data.forEach(feed => {
    const fid = feed.fid;
    
    feed.feedContents.forEach((feedContent: any) => {
      // Find the latest post date for each blog
      let latestDate = '';
      
      if (feedContent.items && feedContent.items.length > 0) {
        // Sort items by date
        const sortedItems = [...feedContent.items].sort((a: any, b: any) => {
          const dateA = a.isoDate || a.pubDate;
          const dateB = b.isoDate || b.pubDate;
          if (dateA && dateB) {
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          }
          return 0;
        });
        
        // Get the most recent date
        latestDate = sortedItems[0].isoDate || sortedItems[0].pubDate;
        
        // Create blog info object
        const blogInfo: BlogInfo = {
          fid,
          title: feedContent.title || 'Untitled Blog',
          description: feedContent.description || '',
          link: feedContent.link || '',
          author: sortedItems[0].author || 'Unknown Author',
          latestPostDate: latestDate
        };
        
        blogMap.set(fid, blogInfo);
      }
    });
  });
  
  // Convert map to array and sort by latest post date
  const blogs = Array.from(blogMap.values()).sort((a, b) => {
    if (a.latestPostDate && b.latestPostDate) {
      return new Date(b.latestPostDate).getTime() - new Date(a.latestPostDate).getTime();
    }
    return 0;
  });
  
  return blogs;
}

// The main hook
export function useGetBlogs(): UseGetBlogsResult {
  const [blogs, setBlogs] = useState<BlogInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching blogs...")
    try {
      let cachedBlogs: BlogInfo[] = [];
      
      try {
        cachedBlogs = await getBlogs();
        if (cachedBlogs.length > 0) {
          console.log('Loading', cachedBlogs.length, 'cached blogs');
          setBlogs(cachedBlogs);
        }
      } catch (cacheErr) {
        console.warn('Could not load cached blogs:', cacheErr);
      }
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/feeds`);
      const data = await response.json();
      console.log('Fetched fresh feed data for blogs');
      
      const freshBlogs = extractBlogInfo(data.data);
      console.log('Processed', freshBlogs.length, 'blogs');
      
      try {
        await storeBlogs(freshBlogs);
        console.log('Cached', freshBlogs.length, 'blogs in IndexedDB');
      } catch (storeErr) {
        console.warn('Failed to cache blogs in IndexedDB:', storeErr);
      }
      
      setBlogs(freshBlogs);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    console.log("Initializing blog fetching...");
    fetchBlogs();
  }, []);
  
  return {
    blogs,
    isLoading,
    error,
    refetch: fetchBlogs
  };
}