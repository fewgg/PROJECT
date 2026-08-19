import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex w-full max-w-[1200px] mx-auto min-h-[80vh] rounded-[32px] overflow-hidden bg-white shadow-2xl border border-slate-100 my-8">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800 mix-blend-multiply opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg">
             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-white kanit-bold text-2xl tracking-wide drop-shadow-md">INVENTORY SYSTEM</span>
        </div>

        <div className="relative z-10 mt-auto">
          <h1 className="text-white kanit-bold text-5xl leading-tight mb-4 drop-shadow-lg">
            สมัครสมาชิก<br />เพื่อเข้าใช้งานระบบ
          </h1>
          <p className="text-blue-100 kanit-regular text-lg max-w-md opacity-90 leading-relaxed">
            เบิกจ่ายพัสดุอุปกรณ์ง่าย รวดเร็ว และติดตามสถานะสต๊อกได้แบบเรียลไทม์ พร้อมระบบอนุมัติที่ปลอดภัย
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#fafbfc]">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full max-w-[440px] shadow-none",
              cardBox: "w-full shadow-none border-0 bg-transparent rounded-none",
              card: "w-full p-0 shadow-none bg-transparent",
              headerTitle: "kanit-bold text-3xl text-slate-900",
              headerSubtitle: "kanit-regular text-slate-500 text-base mt-2",
              socialButtonsBlockButton: "rounded-xl border-slate-200 h-12 kanit-medium hover:bg-slate-50 transition-colors",
              socialButtonsBlockButtonText: "kanit-medium text-[15px]",
              dividerText: "kanit-regular text-slate-400",
              formFieldLabel: "kanit-medium text-slate-700 text-sm",
              formFieldInput: "rounded-xl h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 kanit-regular text-base px-4",
              formButtonPrimary: "rounded-xl h-12 kanit-medium text-[15px] bg-blue-600 hover:bg-blue-700 shadow-md transition-all mt-2",
              footerActionText: "kanit-regular text-slate-500",
              footerActionLink: "kanit-medium text-blue-600 hover:text-blue-700",
            }
          }}
        />
      </div>
    </div>
  )
}
