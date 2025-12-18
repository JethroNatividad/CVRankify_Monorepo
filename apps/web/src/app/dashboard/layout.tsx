import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Navbar from "../_components/navbar";
import { api } from "~/trpc/server";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  const companyName = await api.setup.getCompanyName();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <Navbar user={session.user} companyName={companyName} />
      <main>{children}</main>
    </div>
  );
}
