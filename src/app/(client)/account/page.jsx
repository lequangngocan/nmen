"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Edit3, MapPin, Plus, X, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const API = "http://localhost:5000/api";

// Modal thêm / sửa địa chỉ
function AddressModal({ address, onClose, onSave }) {
  const [form, setForm] = useState({
    label:         address?.label         || "Nhà",
    recipient:     address?.recipient     || "",
    phone:         address?.phone         || "",
    address:       address?.address       || "",
    province_id: address?.province_id || "",
    commune_id:  address?.commune_id  || "",
    is_default:    address?.is_default    || false,
  });

  const [provinces, setProvinces]         = useState([]);
  const [communes, setCommunes]           = useState([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState("");

  // load tỉnh
  useEffect(() => {
    fetch(`${API}/locations/provinces`)
      .then((r) => r.json())
      .then(setProvinces)
      .catch(console.error);
  }, []);

  // load xã/phường khi chọn tỉnh
  useEffect(() => {
    if (!form.province_id) { 
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCommunes([]); 
      return; 
    }
    setLoadingCommunes(true);
    fetch(`${API}/locations/provinces/${form.province_id}/communes`)
      .then((r) => r.json())
      .then((data) => { 
        setCommunes(data); 
        setLoadingCommunes(false); 
      })
      .catch(() => setLoadingCommunes(false));
  }, [form.province_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      // reset xã/phường khi đổi tỉnh
      if (name === "province_id") updated.commune_id = "";
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const token = localStorage.getItem("nmen_token");
    const method = address ? "PUT" : "POST";
    const url = address ? `${API}/addresses/${address.id}` : `${API}/addresses`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Có lỗi xảy ra"); setSaving(false); return; }
      onSave();
    } catch {
      setError("Không kết nối được server");
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-stone-300 focus:border-black px-0 py-2.5 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black text-sm";
  const selectClass =
    "w-full bg-transparent border-b border-stone-300 focus:border-black px-0 py-2.5 transition-colors focus:ring-0 outline-none text-black text-sm appearance-none disabled:opacity-40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-lg mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-headline text-xl font-black uppercase tracking-tight">
            {address ? "Sửa địa chỉ" : "Thêm địa chỉ"}
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nhãn */}
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Nhãn</label>
            <select name="label" value={form.label} onChange={handleChange} className={selectClass}>
              <option value="Nhà">Nhà</option>
              <option value="Công ty">Công ty</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Tên người nhận */}
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Tên người nhận *</label>
            <input name="recipient" value={form.recipient} onChange={handleChange} placeholder="Nguyễn Văn A" className={inputClass} required />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Số điện thoại</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="0912 345 678" className={inputClass} />
          </div>

          {/* Địa chỉ chi tiết */}
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Số nhà, tên đường *</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="12 Nguyễn Huệ" className={inputClass} required />
          </div>

          {/* Tỉnh / Thành phố */}
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Tỉnh / Thành phố *</label>
            <select name="province_id" value={form.province_id} onChange={handleChange} className={selectClass} required>
              <option value="">-- Chọn tỉnh/thành --</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Xã / Phường */}
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Xã / Phường *</label>
            <select
              name="commune_id"
              value={form.commune_id}
              onChange={handleChange}
              className={selectClass}
              disabled={!form.province_id || loadingCommunes}
              required
            >
              <option value="">{loadingCommunes ? "Đang tải..." : "-- Chọn xã/phường --"}</option>
              {communes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Mặc định */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} className="w-4 h-4 accent-black" />
            <span className="font-label text-xs uppercase tracking-widest text-stone-600">Đặt làm địa chỉ mặc định</span>
          </label>

          {/* Nút lưu */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-black text-white py-3 font-headline font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu địa chỉ"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-stone-300 py-3 font-headline font-bold text-xs uppercase tracking-widest hover:border-black transition-all">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountProfilePage() {
  const { user, mounted } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  // dữ liệu user cứng — chưa có API edit profile nên để static
  const userData = {
    fullName: user?.full_name || "Người dùng NMen",
    email:    user?.email    || "",
    tier:     user?.tier     || "Hạng Đồng",
    points:   user?.points   || 0,
    joined:   "Tháng 10, 2023",
    avatarUrl: "/images/img_1e016e8b.jpg",
  };

  const loadAddresses = () => {
    const token = localStorage.getItem("nmen_token");
    if (!token) { setLoadingAddr(false); return; }
    fetch(`${API}/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setAddresses(Array.isArray(data) ? data : []); setLoadingAddr(false); })
      .catch(() => setLoadingAddr(false));
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAddresses(); 
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xóa địa chỉ này?")) return;
    const token = localStorage.getItem("nmen_token");
    await fetch(`${API}/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAddresses();
  };

  const handleSetDefault = async (id) => {
    const token = localStorage.getItem("nmen_token");
    await fetch(`${API}/addresses/${id}/default`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAddresses();
  };

  const openCreate = () => { setEditingAddress(null); setModalOpen(true); };
  const openEdit = (addr) => { setEditingAddress(addr); setModalOpen(true); };
  const handleModalSave = () => { setModalOpen(false); loadAddresses(); };

  if (!mounted || !user) return <div className="min-h-screen"></div>;

  return (
    <>
      {modalOpen && (
        <AddressModal
          address={editingAddress}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
        />
      )}

      <section className="space-y-24 lg:space-y-32">

        {/* PHẦN 1: Thông tin cá nhân */}
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
              <label className="font-label text-[10px] uppercase tracking-widest text-stone-500 font-bold">Full Name</label>
              <input type="text" defaultValue={userData.fullName} readOnly className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 px-0 py-2 font-body text-lg outline-none text-black cursor-default focus:ring-0 focus:border-black transition-colors" />
            </div>
            <div className="space-y-2 group">
              <label className="font-label text-[10px] uppercase tracking-widest text-stone-500 font-bold">Email Address</label>
              <input type="email" defaultValue={userData.email} readOnly className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 px-0 py-2 font-body text-lg outline-none text-black cursor-default focus:ring-0 focus:border-black transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-stone-500 font-bold">Membership Status</label>
              <div className="flex items-center gap-2 py-2">
                <span className="bg-stone-800 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">{userData.tier}</span>
                <span className="text-xs text-stone-500 font-medium italic underline underline-offset-4 cursor-pointer hover:text-black">View Benefits</span>
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN 2: Avatar + Địa chỉ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

          {/* Avatar */}
          <div className="md:col-span-4 bg-stone-200 p-8 lg:p-12 space-y-8">
            <div>
              <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-2 block">Identity & Origin</span>
              <div className="aspect-square bg-stone-300 relative overflow-hidden group">
                <Image src={userData.avatarUrl} alt="Profile" fill className="object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 right-0 p-4 bg-black text-white cursor-pointer active:scale-95 transition-all hover:bg-stone-800">
                  <Edit3 size={18} />
                </div>
              </div>
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-headline font-black text-xl uppercase tracking-tighter text-black">{userData.fullName}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Thành viên từ {userData.joined}</p>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="md:col-span-8 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-2 block">Địa chỉ & Thanh toán</span>
                <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase text-black">Địa Chỉ Giao Hàng</h2>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-black text-white px-4 py-2.5 font-headline font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-95"
              >
                <Plus size={14} />
                Thêm mới
              </button>
            </div>

            {/* Danh sách địa chỉ */}
            {loadingAddr ? (
              <div className="text-sm text-stone-400 py-8 text-center">Đang tải...</div>
            ) : addresses.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-stone-300">
                <MapPin size={32} className="mx-auto text-stone-300 mb-3" />
                <p className="text-sm text-stone-400 mb-4">Bạn chưa có địa chỉ nào</p>
                <button onClick={openCreate} className="font-label text-xs uppercase tracking-widest underline underline-offset-4 text-black hover:text-stone-500">
                  Thêm địa chỉ đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-6 lg:p-8 space-y-4 shadow-sm ring-1 transition-all ${
                      addr.is_default ? "bg-stone-900 text-white ring-stone-900" : "bg-white ring-stone-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-label text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${addr.is_default ? "bg-white text-black" : "bg-stone-100 text-stone-600"}`}>
                            {addr.label}
                          </span>
                          {addr.is_default && (
                            <span className="flex items-center gap-1 font-label text-[10px] font-bold uppercase tracking-widest text-white/70">
                              <Star size={10} fill="currentColor" /> Mặc định
                            </span>
                          )}
                        </div>
                        <p className={`font-body text-base font-medium ${addr.is_default ? "text-white" : "text-black"}`}>
                          {addr.recipient}
                          {addr.phone && <span className={`ml-2 text-sm ${addr.is_default ? "text-white/60" : "text-stone-400"}`}>· {addr.phone}</span>}
                        </p>
                        <p className={`text-sm leading-relaxed ${addr.is_default ? "text-white/70" : "text-stone-500"}`}>
                          {addr.address}
                        </p>
                        <p className={`text-sm ${addr.is_default ? "text-white/60" : "text-stone-400"}`}>
                          {addr.commune_name && `${addr.commune_name}, `}{addr.province_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2 border-t border-white/10">
                      <button onClick={() => openEdit(addr)} className={`font-label text-[10px] font-black uppercase tracking-widest underline underline-offset-4 transition-colors ${addr.is_default ? "text-white hover:text-white/60" : "text-black hover:text-stone-500"}`}>
                        Chỉnh sửa
                      </button>
                      {!addr.is_default && (
                        <button onClick={() => handleSetDefault(addr.id)} className="font-label text-[10px] font-black uppercase tracking-widest text-black underline underline-offset-4 hover:text-stone-500 transition-colors">
                          Đặt mặc định
                        </button>
                      )}
                      <button onClick={() => handleDelete(addr.id)} className={`font-label text-[10px] font-black uppercase tracking-widest underline underline-offset-4 transition-colors flex items-center gap-1 ${addr.is_default ? "text-red-300 hover:text-red-200" : "text-red-500 hover:text-red-700"}`}>
                        <Trash2 size={10} /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Điểm thưởng */}
            <div className="relative bg-black p-8 lg:p-12 overflow-hidden text-white shadow-xl mt-4">
              <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 opacity-50 -mr-20 -mt-20 rotate-45 pointer-events-none"></div>
              <div className="relative z-10 space-y-6">
                <h4 className="font-headline text-2xl font-black tracking-tighter uppercase">Điểm Thưởng Editorial</h4>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-headline font-black">{userData.points.toLocaleString("vi-VN")}</span>
                  <span className="font-label text-[10px] text-white/60 uppercase tracking-widest mb-2">Điểm</span>
                </div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-[75%] h-full bg-white rounded-full"></div>
                </div>
                <p className="text-white/60 font-label text-[10px] uppercase tracking-widest">Cần 250 điểm để nhận thưởng tiếp theo</p>
              </div>
            </div>

          </div>
        </div>

      </section>
    </>
  );
}
