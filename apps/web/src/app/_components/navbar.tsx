"use client";

import React from "react";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";

type Props = {
  user?: User;
  companyName?: string;
};

const Navbar = ({ user, companyName }: Props) => {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="flex justify-between border-b px-8 py-4">
      <Link href="/jobs">
        <h1 className="text-2xl font-bold">{companyName ?? "CVRankify"}</h1>
      </Link>

      {!user && (
        <Link href="/dashboard">
          <Button variant="outline">admin</Button>
        </Link>
      )}

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <span>{user.name}</span> <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
};

export default Navbar;
