"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Loader2, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const PAYMENT_METHODS = ["COD", "Sepay"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, mounted: cartMounted } = useCart();
  const { user, mounted: authMounted } = useAuth();

  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");

  // ─── Địa chỉ đã lưu ────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // ─── Form nhập tay ─────────────────────────────────────────────
  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    provinceId: "",
    communeId: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  // Pre-fill user info khi đăng nhập
  useEffect(() => {
    if (authMounted && user) {
      const parts = user.full_name?.split(" ") || [];
      const firstName = parts.length > 1 ? parts.pop() : user.full_name || "";
      const lastName = parts.join(" ") || "";
      setShippingForm((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || user.email || "",
      }));

      // Load địa chỉ đã lưu
      apiGet("/api/addresses").then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          // Tự động chọn địa chỉ mặc định
          const def = data.find((a) => a.is_default) || data[0];
          applyAddress(def);
        }
      }).catch(() => {});
    }
  }, [authMounted, user]);

  // Áp dụng địa chỉ đã lưu vào form
  const applyAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShippingForm((prev) => ({
      ...prev,
      phone:     addr.phone || prev.phone,
      address:   addr.address,
      provinceId: String(addr.province_id),
      communeId:  addr.commune_id ? String(addr.commune_id) : "",
    }));
    // Nếu tên người nhận khác user thì dùng tên người nhận
    if (addr.recipient) {
      const parts = addr.recipient.split(" ");
      const fn = parts.length > 1 ? parts.pop() : addr.recipient;
      const ln = parts.join(" ");
      setShippingForm((prev) => ({ ...prev, firstName: fn, lastName: ln }));
    }
  };

  // Load tỉnh/thành
  useEffect(() => {
    apiGet("/api/locations/provinces")
      .then((data) => { if (Array.isArray(data)) setProvinces(data); })
      .catch(console.error);
  }, []);

  // Load xã/phường khi chọn tỉnh
  useEffect(() => {
    if (!shippingForm.provinceId) { setCommunes([]); return; }
    setLoadingCommunes(true);
    setShippingForm((prev) => ({ ...prev, communeId: "" }));
    apiGet(`/api/locations/provinces/${shippingForm.provinceId}/communes`)
      .then((data) => { if (Array.isArray(data)) setCommunes(data); })
      .catch(() => {})
      .finally(() => setLoadingCommunes(false));
  }, [shippingForm.provinceId]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
    // Nếu user tự chỉnh → bỏ chọn địa chỉ đã lưu
    if (selectedAddressId && ["address", "phone", "provinceId", "communeId"].includes(name)) {
      setSelectedAddressId(null);
    }
  };

  // ─── Submit ────────────────────────────────────────────────────
  const handleConfirm = async (e) => {
    e.preventDefault();
    if (items.length === 0) { alert("Giỏ hàng của bạn đang trống!"); return; }
    if (
      !shippingForm.firstName || !shippingForm.email ||
      !shippingForm.phone    || !shippingForm.address ||
      !shippingForm.provinceId
    ) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng (Tên, Email, SĐT, Địa chỉ, Tỉnh/Thành)!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: `${shippingForm.lastName} ${shippingForm.firstName}`.trim(),
        email:         shippingForm.email,
        phone:         shippingForm.phone,
        address:       shippingForm.address,
        province_id:   Number(shippingForm.provinceId),
        commune_id:    shippingForm.communeId ? Number(shippingForm.communeId) : null,
        payment_method: selectedPayment,
        promo_code:    promoCode || undefined,
        note:          note || undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          quantity:   item.quantity,
          size:       item.size,
          color:      item.color,
          color_name: item.color_name || null,
        })),
      };

      const res = await apiPost("/api/orders", payload);
      clearCart();
      router.push(`/order/success?order=${res.order_number}&total=${res.total_amount}&phone=${encodeURIComponent(shippingForm.phone)}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartMounted) return <div className="min-h-screen bg-surface" />;

  const inputClass =
    "w-full bg-transparent border-b border-stone-300 focus:border-black border-t-0 border-l-0 border-r-0 px-0 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black";
  const selectClass =
    "w-full bg-transparent border-b border-stone-300 focus:border-black border-t-0 border-l-0 border-r-0 px-0 py-3 transition-colors focus:ring-0 outline-none text-black appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="pt-4 lg:pt-8 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-12 lg:mb-20">
        <h1 className="font-headline text-3xl lg:text-5xl font-extrabold tracking-tighter uppercase mb-4 text-black">Thanh Toán</h1>
        <p className="font-body text-sm text-stone-500 uppercase tracking-widest flex items-center gap-2">
          <Lock size={12} /> Cổng Giao Dịch An Toàn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-7 space-y-16 lg:space-y-24">

          {/* ── SECTION 01: Địa chỉ ── */}
          <section>
            <div className="flex items-center space-x-4 mb-10">
              <span className="font-headline text-2xl font-black text-black">01</span>
              <h2 className="font-headline text-xl lg:text-2xl font-bold uppercase tracking-tight text-black">Địa Chỉ Nhận Hàng</h2>
            </div>

            {/* Picker địa chỉ đã lưu — chỉ hiện khi đã login VÀ có địa chỉ */}
            {user && savedAddresses.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] font-label uppercase tracking-widest text-stone-500 mb-3">Địa chỉ đã lưu</p>
                <div className="space-y-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applyAddress(addr)}
                      className={`w-full text-left px-4 py-3 border transition-all flex items-start gap-3 ${
                        selectedAddressId === addr.id
                          ? "border-black bg-stone-50"
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <MapPin size={14} className="mt-0.5 shrink-0 text-stone-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black">
                          {addr.recipient}
                          {addr.label && (
                            <span className="ml-2 text-[10px] font-label uppercase tracking-widest text-stone-400 border border-stone-300 px-1.5 py-0.5">
                              {addr.label}
                            </span>
                          )}
                          {addr.is_default === 1 && (
                            <span className="ml-2 text-[10px] font-label uppercase tracking-widest text-emerald-600 border border-emerald-300 px-1.5 py-0.5">
                              Mặc định
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5 truncate">
                          {addr.address}{addr.commune_name ? `, ${addr.commune_name}` : ""}, {addr.province_name}
                        </p>
                        {addr.phone && <p className="text-xs text-stone-400">{addr.phone}</p>}
                      </div>
                      {selectedAddressId === addr.id && (
                        <span className="shrink-0 w-4 h-4 rounded-full bg-black mt-0.5" />
                      )}
                    </button>
                  ))}

                  {/* Nhập địa chỉ khác */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(null);
                      setShippingForm((prev) => ({ ...prev, address: "", provinceId: "", communeId: "", phone: "" }));
                    }}
                    className={`w-full text-left px-4 py-3 border border-dashed transition-all text-sm ${
                      selectedAddressId === null && shippingForm.address === ""
                        ? "border-black text-black"
                        : "border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600"
                    }`}
                  >
                    + Nhập địa chỉ khác
                  </button>
                </div>
                <div className="border-t border-stone-200 my-8" />
              </div>
            )}

            {/* Form thông tin */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Tên *</label>
                <input type="text" name="firstName" value={shippingForm.firstName} onChange={handleShippingChange}
                  placeholder="VD: Tuấn" className={inputClass} />
              </div>

              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Họ</label>
                <input type="text" name="lastName" value={shippingForm.lastName} onChange={handleShippingChange}
                  placeholder="VD: Nguyễn" className={inputClass} />
              </div>

              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Email *</label>
                <input type="email" name="email" value={shippingForm.email} onChange={handleShippingChange}
                  placeholder="VD: tuan@example.com" className={inputClass} />
              </div>

              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Số điện thoại *</label>
                <input type="tel" name="phone" value={shippingForm.phone} onChange={handleShippingChange}
                  placeholder="VD: 0912345678" className={inputClass} />
              </div>

              <div className="md:col-span-2">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Địa chỉ *</label>
                <input type="text" name="address" value={shippingForm.address} onChange={handleShippingChange}
                  placeholder="Số nhà, tên đường" className={inputClass} />
              </div>

              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Tỉnh / Thành phố *</label>
                <select name="provinceId" value={shippingForm.provinceId} onChange={handleShippingChange} className={selectClass}>
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Xã / Phường</label>
                <select name="communeId" value={shippingForm.communeId} onChange={handleShippingChange}
                  disabled={!shippingForm.provinceId || loadingCommunes} className={selectClass}>
                  <option value="">{loadingCommunes ? "Đang tải..." : "-- Chọn xã/phường --"}</option>
                  {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </form>
          </section>

          {/* ── SECTION 02: Thanh toán ── */}
          <section>
            <div className="flex items-center space-x-4 mb-10">
              <span className="font-headline text-2xl font-black text-black">02</span>
              <h2 className="font-headline text-xl lg:text-2xl font-bold uppercase tracking-tight text-black">Thông Tin Thanh Toán</h2>
            </div>
            <div className="flex flex-wrap gap-3 mb-10">
              {PAYMENT_METHODS.map((method) => (
                <button key={method} onClick={() => setSelectedPayment(method)}
                  className={`px-6 py-3 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                    selectedPayment === method ? "border-black text-black" : "border-stone-300 text-stone-400 hover:border-black hover:text-black"
                  }`}>
                  {method}
                </button>
              ))}
            </div>
            {selectedPayment === "COD" && (
              <div className="py-8 px-4 text-center border border-stone-200 bg-stone-50">
                <p className="font-body text-sm text-black">Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng tận nơi (Cash on Delivery).</p>
              </div>
            )}
            {selectedPayment === "Sepay" && (
              <div className="py-8 px-4 text-center border border-dashed border-stone-300">
                <p className="font-body text-sm text-stone-500">Tích hợp mã QR Sepay — Ra mắt sớm. (Chức năng này đang bảo trì)</p>
              </div>
            )}
          </section>

          {/* ── SECTION 03: Ghi chú ── */}
          <section>
            <div className="flex items-center space-x-4 mb-6">
              <span className="font-headline text-2xl font-black text-black">03</span>
              <h2 className="font-headline text-xl lg:text-2xl font-bold uppercase tracking-tight text-black">Ghi Chú</h2>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú cho đơn hàng (tùy chọn)..." rows={3}
              className="w-full bg-transparent border border-stone-300 focus:border-black px-4 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black font-body text-sm resize-none" />
          </section>

          {/* ── Nút đặt hàng ── */}
          <div className="pt-4">
            <button onClick={handleConfirm} disabled={isSubmitting || items.length === 0}
              className="w-full md:w-auto bg-black text-white px-16 py-6 font-headline font-bold uppercase tracking-[0.2em] text-sm hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Xác Nhận Đặt Hàng
            </button>
            <p className="text-stone-500 text-[10px] mt-4 font-body">
              Bằng cách đặt hàng, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của NMen.
            </p>
          </div>
        </div>

        {/* ── Sidebar: Tóm tắt đơn hàng ── */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-stone-100 p-6 lg:p-10">
            <h2 className="font-headline text-xl font-bold uppercase tracking-tight mb-10 text-black">Tóm Tắt Đơn Hàng</h2>
            <div className="space-y-8 mb-12 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6">
                  <div className="w-24 h-32 bg-stone-200 overflow-hidden relative shrink-0">
                    <Image src={item.image} alt={item.product_name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-headline font-bold text-sm uppercase text-black">{item.product_name}</h3>
                      <p className="font-label text-[10px] text-stone-500 mt-1 uppercase tracking-widest">
                        {item.size && `Size: ${item.size}`} {item.color_name && `| ${item.color_name}`}<br />
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-headline font-bold text-sm text-black">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex gap-3">
                <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Mã Giảm Giá"
                  className="flex-1 bg-transparent border-b border-stone-400 focus:border-black px-0 py-2 transition-colors focus:ring-0 outline-none font-label text-xs uppercase placeholder:text-stone-400 text-black" />
                <button className="font-label text-[10px] uppercase font-bold hover:text-stone-500 transition-colors text-black">Áp Dụng</button>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-stone-300">
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-500">
                <span>Cộng gộp</span>
                <span className="text-black">{subtotal.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-500">
                <span>Giao hàng</span>
                <span className="font-bold text-black">Miễn phí</span>
              </div>
              <div className="flex justify-between font-headline text-xl font-black uppercase pt-4 border-t border-stone-300 text-black">
                <span>Tổng Cộng</span>
                <span>{subtotal.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/cart" className="font-label text-[10px] uppercase tracking-widest text-stone-500 hover:text-black underline underline-offset-4 transition-colors">
                ← Chỉnh sửa giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
