import { currentUser } from "@clerk/nextjs/server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await currentUser();
  const department = (user?.publicMetadata?.department as string) || "";

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl kanit-bold tracking-tight text-slate-900 mb-2">โปรไฟล์ของฉัน</h1>
        <p className="kanit-regular text-slate-500">จัดการข้อมูลส่วนตัว บัญชี และสาขาวิชาของคุณ</p>
      </div>

      <div className="space-y-8">
        <section>
          <ProfileClient department={department} />
        </section>
      </div>
    </div>
  );
}
