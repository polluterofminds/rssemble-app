import React, { useEffect, useState } from "react";
import { PlusCircle, X, LockIcon } from "lucide-react";
import { useGetBlogs } from "../hooks/useGetBlogs";
import { Connector, useAccount, useConnect } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { abi } from "../utils/abi";
import { useGetAllFeeds } from "../hooks/useGetFeeds";
import { Link } from "react-router";
import { MiniLink } from "./MiniLink";
import { base } from "viem/chains";

const Blogs: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const { blogs, refetch } = useGetBlogs();
  const { refetch: refetchFeeds, validateFeed } = useGetAllFeeds();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fid: "",
    feedUrl: "",
  });

  const { connectAsync, connectors } = useConnect();
  const { isConnected } = useAccount();
  const {
    data: hash,
    writeContract,
    error: contractError,
  } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (hash && isConfirmed) {
      setFormData({ fid: "", feedUrl: "" });
      setIsModalOpen(false);
      handleRefetch();
    }

    if (contractError) {
      console.log(contractError);
      alert("Error writing to contract");
      setSubmitting(false);
    }
  }, [hash, contractError, isConfirmed]);

  const handleRefetch = async () => {
    console.log("Refetching...");
    await refetchFeeds();
    await refetch();
    console.log("Refetch complete!");
    setSubmitting(false);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("Submitting new blog:", formData);
    const { isValid, error } = await validateFeed(formData.feedUrl);

    if (!isValid) {
      alert(error);
      setSubmitting(false);
      return;
    }

    writeContract({
      address: `${import.meta.env.VITE_CONTRACT_ADDRESS}` as `0xstring`,
      abi: abi,
      functionName: "addFeed",
      args: [BigInt(formData.fid), formData.feedUrl],
      chainId: base.id
    });
  };

  const handleConnect = async (connector: Connector) => {
    try {
      await connectAsync({ connector });
      setIsConnectModalOpen(false);
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
      alert("Trouble connecting");
    }
  };

  return (
    <div className="px-2 sm:px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dark-100">
            Blogs ({blogs.length})
          </h1>
          <p className="text-dark-400 text-sm">Add blog subscriptions</p>
        </div>
      </div>
      <div className="space-y-3">
        {isConnected ? (
          <button
            className="w-full bg-dark-700 rounded-lg p-4 border border-dashed border-dark-500
              hover:border-primary hover:text-primary
              flex items-center justify-center space-x-2
              transition-colors duration-200 text-dark-400"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add a new blog</span>
          </button>
        ) : (
          <button
            className="w-full bg-dark-700 rounded-lg p-4 border border-dashed border-dark-500
            hover:border-primary hover:text-primary
            flex items-center justify-center space-x-2
            transition-colors duration-200 text-dark-400"
            onClick={() => setIsConnectModalOpen(true)}
          >
            <LockIcon className="h-5 w-5" />
            <span>Connect to add blog</span>
          </button>
        )}
        {blogs.map((blog, index) => (
          <div
            key={blog.link}
            className="bg-dark-700 rounded-lg p-4 border border-dark-600 hover:border-dark-500
              transition-all duration-200 ease-in-out animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Card layout restructured for better mobile responsiveness */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              {/* Blog avatar */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-dark-600 flex items-center justify-center text-primary font-medium">
                  {blog.title.charAt(0)}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <Link to={`/feed/blog/${encodeURI(blog.title.replace(" ", "_"))}`}>
                    <h3 className="text-dark-100 font-medium">{blog.title}</h3>
                  </Link>
                  <MiniLink href={blog.link} className="text-dark-400 text-xs truncate block max-w-full">
                    {blog.link}
                  </MiniLink>
                </div>
              </div>
              
              {/* Date tag moved to a new line on mobile, same line on larger screens */}
              <div className="mt-2 sm:mt-0 sm:ml-auto">
                <span className="px-2 py-1 bg-dark-600 rounded text-dark-300 text-xs inline-block">
                  Most recent: {new Date(blog.latestPostDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-dark-100">
                Connect wallet
              </h2>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-dark-400 hover:text-dark-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              {connectors.map((connector) => (
                <div key={connector.id}>
                <button                  
                  onClick={() => handleConnect(connector)}
                  className="cursor-pointer hover:underline"
                >
                  {connector.name}
                </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-dark-100">
                Add New Blog
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-dark-400 hover:text-dark-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fid"
                    className="block text-sm font-medium text-dark-300 mb-1"
                  >
                    FID
                  </label>
                  <input
                    type="number"
                    id="fid"
                    name="fid"
                    value={formData.fid}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-dark-600 border border-dark-500 rounded-md text-dark-100 focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedUrl"
                    className="block text-sm font-medium text-dark-300 mb-1"
                  >
                    Feed URL
                  </label>
                  <input
                    type="text"
                    id="feedUrl"
                    name="feedUrl"
                    value={formData.feedUrl}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-dark-600 border border-dark-500 rounded-md text-dark-100 focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-200"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;