import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Toaster } from "./_components/ui/sonner";

export const metadata: Metadata = {
  title: "CVRankify",
  description: "A platform for ranking CVs",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";

  const userCount = await api.setup.userCount();

  if (userCount < 1 && pathname !== "/setup") {
    redirect("/setup");
  }

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
