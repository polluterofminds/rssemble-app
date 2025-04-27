import React, { useState, useEffect } from 'react';
import FeedItem from './FeedItem';
import { useGetAllFeeds } from '../hooks/useGetFeeds';

const Feed: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { allFeeds, isLoading: isFeedLoading } = useGetAllFeeds();

  useEffect(() => {
    if(!isFeedLoading) {
        setIsLoading(false);
    }
  }, [isFeedLoading]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-4 bg-dark-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-dark-700 rounded w-1/4 mb-4"></div>
            <div className="h-3 bg-dark-700 rounded w-full mb-1"></div>
            <div className="h-3 bg-dark-700 rounded w-full mb-1"></div>
            <div className="h-3 bg-dark-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 py-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-dark-100">Feed</h1>
        <p className="text-dark-400 text-sm">
          {allFeeds.length} articles
        </p>
      </div>
      
      <div className="space-y-3">
        {allFeeds.map((post, index) => (
          <FeedItem 
            key={post.guid} 
            post={post} 
            className={`animate-slide-up`}
            style={{ animationDelay: `${index * 0.05}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;