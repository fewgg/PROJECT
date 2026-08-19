"use client";

import { UserProfile } from "@clerk/nextjs";
import { Camera, Building2 } from "lucide-react";
import { ProfileImageUpload } from "@/components/ui-custom/ProfileImageUpload";
import ProfileDepartmentClient from "./ProfileDepartmentClient";

export default function ProfileClient({ department }: { department: string }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide the avatar upload section in Clerk's default profile form */
        .cl-profileSection__profile .cl-avatarImageActions,
        .cl-profileSection__profile .cl-fileDropArea,
        .cl-profileSection__profile .cl-formFieldRow__profileImage {
          display: none !important;
        }
        /* Alternatively target the container that holds the image upload in the update form */
        .cl-formFieldRow:has(input[type="file"]) {
          display: none !important;
        }
      `}} />
      <UserProfile 
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full max-w-full shadow-sm rounded-3xl",
            cardBox: "w-full shadow-sm border border-slate-100 rounded-3xl",
            card: "w-full rounded-3xl",
            headerTitle: "kanit-bold text-2xl text-slate-900",
            headerSubtitle: "kanit-regular text-slate-500 text-base mt-2",
            badge: "bg-blue-50 text-blue-700",
            profileSectionTitleText: "kanit-semibold text-slate-800",
            profileSectionTitle: "border-b border-slate-100",
            accordionTriggerButton: "kanit-medium text-slate-700 hover:bg-slate-50",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 shadow-sm kanit-medium h-10 rounded-xl",
            formButtonReset: "text-slate-600 hover:bg-slate-100 kanit-medium rounded-xl",
            navbarButton: "kanit-medium text-slate-600 hover:bg-slate-50",
            navbarButton__active: "kanit-medium text-blue-700 bg-blue-50",
            
            // Hide the avatar image actions (upload, remove) from the default profile form
            avatarImageActions: "hidden",
            fileDropArea: "hidden",
            avatarImageActionsUpload: "hidden",
            avatarImageActionsRemove: "hidden",
          }
        }}
      >
      <UserProfile.Page label="เปลี่ยนรูปโปรไฟล์" labelIcon={<Camera className="w-4 h-4" />} url="avatar">
        <div className="p-8">
          <h2 className="text-xl kanit-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            เปลี่ยนรูปโปรไฟล์
          </h2>
          <ProfileImageUpload />
        </div>
      </UserProfile.Page>
      
      <UserProfile.Page label="สาขาวิชา / แผนก" labelIcon={<Building2 className="w-4 h-4" />} url="department">
        <div className="p-8">
          <h2 className="text-xl kanit-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            ข้อมูลสาขาวิชา / แผนก
          </h2>
          <ProfileDepartmentClient initialDepartment={department} />
        </div>
      </UserProfile.Page>
    </UserProfile>
    </>
  );
}
