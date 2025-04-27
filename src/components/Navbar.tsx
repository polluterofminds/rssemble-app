import {
  Disclosure,  
} from "@headlessui/react";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Nav } from "../utils/types";
import { BellIcon, Rss } from "lucide-react";
import { sdk } from "@farcaster/frame-sdk";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const location = useLocation();
  const [navigation, setNavigation] = useState<Nav[]>([
    { name: "Feed", href: "/feed", current: true },
    { name: "Blogs", href: "/blogs", current: false },
  ]);

  useEffect(() => {
    const pathname = location.pathname;
    const parsedNav = JSON.parse(JSON.stringify(navigation));
    const found = parsedNav.find((n: Nav) => n.href === pathname);
    if (found) {
      parsedNav.forEach((n: Nav) => {
        if (n.href === pathname) {
          n.current = true;
        } else {
          n.current = false;
        }
      });

      setNavigation(parsedNav);
    } else {
      parsedNav.forEach((n: Nav) => {
        n.current = false;
      });

      setNavigation(parsedNav);
    }
  }, [location]);

  const handleToggleFrame = async () => {
    await sdk.actions.addFrame();
  }

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {() => (
        <>
          <div className="mx-auto px-4">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-center items-stretch justify-start">
                <div className="flex shrink-0 items-center">
                  <Rss className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={`${item.href}`}
                        aria-current={item.current ? "page" : undefined}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={handleToggleFrame} className="rounded-full p-1 text-gray-400 hover:text-white">
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
