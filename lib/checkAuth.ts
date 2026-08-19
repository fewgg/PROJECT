import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function checkOnboarding() {
  const { userId } = await auth();
  if (userId) {
    const user = await currentUser();
    if (user && (!user.publicMetadata?.department || !user.firstName || !user.lastName)) {
      redirect("/onboarding");
    }
  }
}
