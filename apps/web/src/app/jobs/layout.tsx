import { api } from "~/trpc/server";
import Navbar from "../_components/navbar";

export default async function JobsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const companyName = await api.setup.getCompanyName();

  return (
    <div>
      <Navbar companyName={companyName} />
      <main>{children}</main>
    </div>
  );
}
