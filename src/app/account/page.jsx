"use client";

import Image from "next/image";
import { Edit3, MoreVertical, MapPin } from "lucide-react";

export default function AccountProfilePage() {
  const userData = {
    fullName: "Julian Thorne",
    email: "julian.thorne@editorial.com",
    phone: "+1 (212) 555-0198",
    tier: "Black Tier",
    joined: "Oct 2022",
    city: "Brooklyn, NY",
    address: "452 Lafayette Street,\nSuite 4B - NoHo,\nNew York, NY 10003\nUnited States",
    points: "1,250",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATEaYUazAVsZXOx6dN4CdxZZqeRc3dYw829vJ0NdkzN7ahDw4yPkdDaQ7hK1Tq7FbC2oVa1XoVzmhaKzCatcOgZwwQYCK3MIUsEZmT-SLgzUEA4wG_srBEwdE0NTGK4LOYTUWJ_gVm87_PPg7Pbvqksu-8Cz5FeVFMvr-llZfDXkmJisY-qTWI1eqt8alaXmPJkrkPqD71QxUe-PnCNHGna7GkJohDtS3FmQWUVi0uabMBs9N8MtOz6s1Ki9BLxt2xqZMhrGORtw",
  };

  return (
    <section className="space-y-24 lg:space-y-32">
      
      {/* SECTION 1: Personal Info */}
      <div className="space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-2 block">Account Details</span>
            <h1 className="font-headline text-4xl lg:text-5xl font-black tracking-tighter uppercase">My Profile</h1>
          </div>
          <button className="bg-black text-white px-8 py-3 font-headline font-bold text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-stone-800">
            Edit All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          <div className="space-y-2 group">
            <label className="font-label text-[10px] uppercase tracking-widest text-stone-500 font-bold group-focus-within:text-black transition-colors">Full Name</label>
            <input 
              type="text" 
              defaultValue={userData.fullName} 
              readOnly 
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 px-0 py-2 font-body text-lg outline-none text-black cursor-default focus:ring-0 focus:border-black transition-colors" 
            />
          </div>

          <div className="space-y-2 group">
            <label className="font-label text-[10px] uppercase tracking-widest text-stone-500 font-bold group-focus-within:text-black transition-colors">Email Address</label>
            <input 
              type="email" 
              defaultValue={userData.email} 
              readOnly 
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 px-0 py-2 font-body text-lg outline-none text-black cursor-default focus:ring-0 focus:border-black transition-colors" 
            />
          </div>

          <div className="space-y-2 group">
            <label className="font-label text-[10px] uppercase tracking-widest text-stone-500 font-bold group-focus-within:text-black transition-colors">Phone Number</label>
            <input 
              type="text" 
              defaultValue={userData.phone} 
              readOnly 
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 px-0 py-2 font-body text-lg outline-none text-black cursor-default focus:ring-0 focus:border-black transition-colors" 
            />
          </div>

          <div className="space-y-2 group">
            <label className="font-label text-[10px] uppercase tracking-widest text-stone-500 font-bold">Membership Status</label>
            <div className="flex items-center gap-2 py-2">
              <span className="bg-stone-800 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                {userData.tier}
              </span>
              <span className="text-xs text-stone-500 font-medium italic underline underline-offset-4 cursor-pointer hover:text-black">
                View Benefits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Identity & Location (Asymmetric Layout V2) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* Box Ảnh đại diện User V2 */}
        <div className="md:col-span-4 bg-stone-200 p-8 lg:p-12 space-y-8">
          <div>
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2 block">
              Identity & Origin
            </span>
            
            <div className="aspect-square bg-stone-300 relative overflow-hidden group">
              <Image 
                src={userData.avatarUrl} 
                alt="Profile" 
                fill 
                className="object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-0 right-0 p-4 bg-black text-white cursor-pointer active:scale-95 transition-all hover:bg-stone-800">
                <Edit3 size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-headline font-black text-xl uppercase tracking-tighter text-black">{userData.fullName}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Member since {userData.joined}<br />
              {userData.city}
            </p>
          </div>
        </div>

        {/* Box Địa Chỉ Mới & Điểm Loyal V2 */}
        <div className="md:col-span-8 space-y-12">
          
          {/* Header Box Địa Chỉ */}
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-2 block">
              Location & Billing
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase text-black">
              Verified Address
            </h2>
          </div>
          
          {/* Box Địa Chỉ Bóng Mờ 3D V2 */}
          <div className="bg-white p-8 lg:p-10 space-y-8 shadow-[0_48px_48px_-12px_rgba(0,0,0,0.04)] ring-1 ring-stone-100">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <MapPin size={18} className="fill-black text-white" />
                  <span className="font-label text-[10px] font-black uppercase tracking-widest bg-stone-100 px-2 py-1 text-black">Primary</span>
                </div>
                <p className="font-body text-xl md:text-2xl font-light leading-relaxed whitespace-pre-line text-black">
                  {userData.address}
                </p>
              </div>

              <button className="text-stone-400 hover:text-black transition-colors shrink-0">
                <MoreVertical size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-8 pt-6">
              <button className="font-label text-[10px] font-black uppercase tracking-widest text-black underline underline-offset-8 hover:text-stone-500 transition-all">Modify</button>
              <button className="font-label text-[10px] font-black uppercase tracking-widest text-black underline underline-offset-8 hover:text-stone-500 transition-all">Delete</button>
              <button className="font-label text-[10px] font-black uppercase tracking-widest text-black underline underline-offset-8 hover:text-stone-500 transition-all">Add New</button>
            </div>
          </div>

          {/* Visual Box Điểm Loyalty (Thẻ hội viên) V2 */}
          <div className="relative bg-black p-8 lg:p-12 overflow-hidden text-white shadow-xl mt-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 opacity-50 -mr-20 -mt-20 rotate-45 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              <h4 className="font-headline text-2xl font-black tracking-tighter uppercase">Editorial Rewards</h4>
              
              <div className="flex items-end gap-2">
                <span className="text-5xl font-headline font-black">{userData.points}</span>
                <span className="font-label text-[10px] text-white/60 uppercase tracking-widest mb-2">Points</span>
              </div>
              
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-[75%] h-full bg-white rounded-full"></div>
              </div>
              <p className="text-white/60 font-label text-[10px] uppercase tracking-widest">250 points until next reward</p>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
