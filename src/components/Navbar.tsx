import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
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
      {({ open }) => (
        <>
          <div className="mx-auto px-4">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {!open ? (
                    <Bars3Icon className="block size-6" aria-hidden="true" />
                  ) : (
                    <XMarkIcon className="block size-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex shrink-0 items-center">
                  <Rss className="h-6 w-6 text-primary" />
                </div>
                <div className="hidden sm:ml-6 sm:block">
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
          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
