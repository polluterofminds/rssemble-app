import { useState, useEffect } from "react";
import { DataFeed, ValidateFeedResponse } from "../utils/types";

interface UseGetAllFeedsResult {
  allFeeds: DataFeed[];
  validateFeed: (url: string) => Promise<ValidateFeedResponse>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function setupIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FeedsDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("feeds")) {
        const store = db.createObjectStore("feeds", { keyPath: "guid" });
        store.createIndex("fid", "fid", { unique: false });
        store.createIndex("isoDate", "isoDate", { unique: false });
        store.createIndex("author", "author", { unique: false });
      }
    };

    request.onerror = (event) => {
      console.error(
        "IndexedDB error:",
        (event.target as IDBOpenDBRequest).error
      );
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
}

function storeFeedItems(items: DataFeed[]): Promise<number> {
  return setupIndexedDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["feeds"], "readwrite");
      const store = transaction.objectStore("feeds");

      let completed = 0;

      transaction.oncomplete = () => {
        resolve(completed);
      };

      transaction.onerror = () => {
        console.error("Transaction error:", transaction.error);
        reject(transaction.error);
      };

      items.forEach((item) => {
        const request = store.put(item);
        request.onsuccess = () => {
          completed++;
        };
      });
    });
  });
}

function getFeedItems(): Promise<DataFeed[]> {
  return setupIndexedDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["feeds"], "readonly");
      const store = transaction.objectStore("feeds");
      const index = store.index("isoDate");

      const request = index.openCursor(null, "prev");
      const items: DataFeed[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          items.push(cursor.value as DataFeed);
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      request.onerror = (event) => {
        console.error("Cursor error:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  });
}

export function useGetAllFeeds(): UseGetAllFeedsResult {
  const [allFeeds, setAllFeeds] = useState<DataFeed[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  function getAllFeedItems(data: any[]): DataFeed[] {
    const allItems: DataFeed[] = [];

    data.forEach((feed) => {
      const fid = feed.fid;

      feed.feedContents.forEach((feedContent: any) => {
        const feedInfo = {
          title: feedContent.title,
          description: feedContent.description,
          link: feedContent.link,
        };

        feedContent.items.forEach((item: any) => {
          const enrichedItem = {
            fid: fid,
            feedInfo: feedInfo,
            author: item.author,
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            content: item.contentSnippet || item.content,
            guid: item.guid,
            categories: item.categories,
          };

          allItems.push(enrichedItem);
        });
      });
    });

    allItems.sort((a: DataFeed, b: DataFeed) => {
      if (a.isoDate && b.isoDate) {
        // @ts-expect-error date comparisons are fine
        return new Date(b.isoDate) - new Date(a.isoDate);
      } else if (a.pubDate && b.pubDate) {
        // @ts-expect-error date comparisons are fine
        return new Date(b.pubDate) - new Date(a.pubDate);
      }
      return 0;
    });

    return allItems;
  }

  const validateFeed = async (url: string): Promise<ValidateFeedResponse> => {
    try {
      // Send the URL to your backend for validation
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/feeds/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedUrl: url }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the response from your backend
      const result = await response.json();

      // Return the validation result
      return {
        isValid: result.data.isValid,
        error: result.data?.error || "",
      };
    } catch (error) {
      console.log("Feed validation error:", error);
      return {
        isValid: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error validating feed",
      };
    }
  };

  const fetchAllFeeds = async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching feeds...");
    try {
      let cachedData: DataFeed[] = [];

      try {
        cachedData = await getFeedItems();
        if (cachedData.length > 0) {
          console.log("Loading", cachedData.length, "cached feed items");
          setAllFeeds(cachedData);
        }
      } catch (cacheErr) {
        console.warn("Could not load cached feeds:", cacheErr);
      }
      console.log("Fetching feeds...")
      const allFeedData = await fetch(`${import.meta.env.VITE_BASE_URL}/feeds`);
      const feeds = await allFeedData.json();
      console.log("Fetched fresh feed data:", feeds);

      const feedsWithContent = getAllFeedItems(feeds.data);
      console.log("Processed", feedsWithContent.length, "fresh feed items");

      try {
        await storeFeedItems(feedsWithContent);
        console.log(
          "Cached",
          feedsWithContent.length,
          "feed items in IndexedDB"
        );
      } catch (storeErr) {
        console.warn("Failed to cache feeds in IndexedDB:", storeErr);
      }

      setAllFeeds(feedsWithContent);
    } catch (err) {
      console.error("Error fetching all feeds:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Initializing feed fetching...");
    fetchAllFeeds();
  }, []);

  return {
    allFeeds,
    validateFeed,
    isLoading,
    error,
    refetch: fetchAllFeeds,
  };
}
