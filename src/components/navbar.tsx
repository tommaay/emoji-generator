"use client";

import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isSignedIn, user } = useUser();

  const getInitials = () => {
    if (!user) return "Me";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (!firstName && !lastName) return "Me";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "Me";
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-foreground">😊</div>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {getInitials()}
                </div>
                <SignOutButton>
                  <Button variant="ghost" size="sm">
                    Sign out
                  </Button>
                </SignOutButton>
              </div>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" className="mr-2">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
