import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { shadcn } from "@clerk/ui/themes";
import { thTH } from "@clerk/localizations";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/components/providers/CartProvider";
import { CartButton } from "@/components/ui-custom/CartButton";
import { RequisitionCart } from "@/components/ui-custom/RequisitionCart";
import { NotificationBell } from "@/components/ui-custom/NotificationBell";
import { FloatingChat } from "@/components/ui-custom/FloatingChat";
import { getSystemSettings } from "@/app/actions/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventory System",
  description: "Enterprise Material Requisition System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const settings = await getSystemSettings();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#f8fafc]`}>
        <ClerkProvider localization={thTH} appearance={{ theme: shadcn }}>
          <TooltipProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                {/* Top Navigation */}
                <header className="sticky top-0 z-50 flex h-[72px] shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 md:px-12 transition-all">
                  <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-transparent shadow-sm group-hover:scale-105 transition-transform">
                        <img src="/logo.png" alt="NMC Logo" className="w-full h-full object-contain" />
                      </div>
                      <div className="kanit-semibold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors hidden sm:block">
                        {settings.systemName || "ระบบคลังพัสดุ"}
                      </div>
                    </Link>
                  </div>
                  
                  {/* Navigation Links */}
                  {!isAdmin && (
                    <div className="hidden md:flex items-center gap-1 mx-6">
                      <Link href="/inventory" className="kanit-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors">
                        หน้าหลัก (เบิกพัสดุ)
                      </Link>
                      <Link href="/requests" className="kanit-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors">
                        ประวัติการเบิก
                      </Link>
                      <Link href="/returns" className="kanit-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-colors">
                        ประวัติการคืน
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center gap-4 ml-auto">
                    {isAdmin && (
                      <Link href="/admin">
                        <span className="kanit-medium text-sm text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors shadow-sm">
                          ระบบหลังบ้าน (Admin)
                        </span>
                      </Link>
                    )}
                    {!isAdmin && <CartButton />}
                    
                    {!isAdmin && <NotificationBell />}
                    
                    {!user && (
                      <SignInButton mode="modal">
                        <span className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white kanit-medium text-sm px-6 py-2.5 rounded-full transition-all shadow-sm">
                          เข้าสู่ระบบ
                        </span>
                      </SignInButton>
                    )}
                    {user && (
                      <UserButton 
                        userProfileMode="navigation"
                        userProfileUrl="/profile"
                        appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} 
                      />
                    )}
                  </div>
                </header>
                
                <main className="flex-1 w-full max-w-[1440px] mx-auto">
                  {children}
                </main>

                <footer className="w-full border-t bg-white py-8 mt-auto">
                  <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center text-slate-500 text-sm kanit-regular">
                    <p>&copy; 2026 {settings.systemName || "ระบบคลังพัสดุ"}. All rights reserved.</p>
                    <div className="flex gap-4">
                      <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                      <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                    </div>
                  </div>
                </footer>
                <FloatingChat />
              </div>
              <RequisitionCart />
            </CartProvider>
          </TooltipProvider>
        </ClerkProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
