"use client";


import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import Image from "next/image";
import Link from "next/link";

const Header = () => {
  const { isSignedIn } = useUser();

  return (
    <header className="fixed top-0 w-full border-b border-[#1f2d1f] bg-[#0a0a0a]/80 backdrop-blur-md z-50">
      <nav className="w-full px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/image.png"
            alt="FastCare"
            width={180}
            height={50}
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-2">

          {!isSignedIn ? (
            <>
              <SignInButton  mode="modal">
                <button  className="border border-[#1f2d1f] text-[#f0fdf4] hover:border-green-800 hover:text-green-400 px-5 py-2.5 rounded-xl transition">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition">
                  Get Started
                </button>
              </SignUpButton>
            </>
          ) : (
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-10 h-10 ring-2 ring-green-600/30",
                    userButtonPopoverCard:"shadow-xl",
                    userPreviewMainIdentifier:"font-semibold",
                },
              }}
            />
          )}

        </div>
      </nav>
    </header>
  );
};

export default Header;
