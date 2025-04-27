import { useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";
// import { v7 as uuidv7 } from "uuid";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router";
import Feed from "./components/Feed";
import Blogs from "./components/Blogs";
import TitleFeed from "./components/TitleFeed";

function App() {
  useEffect(() => {
    const initSdk = async () => {
      await sdk.actions.ready();
    };

    initSdk();
  }, []);

  // const signIn = async () => {
  //   const nonce = uuidv7();
  //   const auth = await sdk.actions.signIn({
  //     nonce,
  //   });
  // };

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100 flex justify-center py-8 px-4">
      <div className="w-full max-w-[500px] flex flex-col bg-dark-800 rounded-lg overflow-hidden shadow-lg">
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/feed/blog/:title" element={<TitleFeed />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
