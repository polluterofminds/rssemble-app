import React, { useState } from "react";
import { Bookmark, BookmarkCheck, Star } from "lucide-react";
import { DataFeed } from "../utils/types";
import { MiniLink } from "./MiniLink";

interface FeedItemProps {
  post: DataFeed;
  className?: string;
  style?: React.CSSProperties;
}

const FeedItem: React.FC<FeedItemProps> = ({ post, className = "", style }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  return (
    <div
      className={`
        bg-dark-700 rounded-lg p-4 
        border border-dark-600 hover:border-dark-500
        transition-all duration-200 ease-in-out
        ${className}
      `}
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <MiniLink
            href={post.link}
            className="text-dark-100 font-medium hover:text-primary line-clamp-2 transition-colors duration-200 text-left"
          >
            {post.title}
          </MiniLink>

          <div className="flex items-center mt-1 space-x-2 text-dark-400 text-xs">
            <span>{post.author}</span>
            <span>•</span>
            <span>{new Date(post.pubDate).toLocaleDateString()}</span>
          </div>

          <p className="mt-2 text-dark-300 text-sm line-clamp-3">
            {post.content}
          </p>
        </div>

        <div className="ml-4 flex flex-col space-y-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="text-dark-400 hover:text-primary focus:outline-none transition-colors duration-200"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={() => setIsStarred(!isStarred)}
            className="text-dark-400 hover:text-primary focus:outline-none transition-colors duration-200"
            aria-label={isStarred ? "Unstar this post" : "Star this post"}
          >
            <Star
              className={`h-5 w-5 ${
                isStarred ? "text-primary fill-primary" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedItem;
