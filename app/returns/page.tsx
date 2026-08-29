import { getUserRequests } from "@/app/actions/requests";
import { checkOnboarding } from "@/lib/checkAuth";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ReturnsClient from "./ReturnsClient";

export const revalidate = 0;

export default async function UserReturnsPage() {
  await checkOnboarding();
  
  const user = await currentUser();
  if (user?.publicMetadata?.role === "admin") {
    redirect("/admin");
  }
  
  const requests = await getUserRequests();

  return <ReturnsClient initialRequests={requests} />;
}
