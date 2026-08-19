import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const user = await currentUser();
  const department = user?.publicMetadata?.department as string | undefined;
  
  return (
    <div className="flex w-full min-h-[80vh] items-center justify-center py-12 px-4">
      <OnboardingClient 
        initialDepartment={department || ""} 
        initialFirstName={user?.firstName || ""} 
        initialLastName={user?.lastName || ""} 
      />
    </div>
  );
}
