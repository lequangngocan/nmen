"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { apiGet, apiPut, getFullUrl } from "@/lib/api";
import { ArrowLeft, Trash2, Plus, Search, AlertCircle, Info } from "lucide-react";

const STATUS_LABELS = {
  pending:    "Chờ xác nhận",
  confirmed:  "Đã xác nhận",
  processing: "Đang xử lý",
  shipping:   "Đang giao",
  delivered:  "Đã giao",
  cancelled:  "Đã hủy",
  returned:   "Trả hàng",
};

const ITEM_EDITABLE = ["pending", "confirmed"];

export default function OrderItemsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // draft state (thay đổi chưa lưu)
  const [draftItems, setDraftItems] = useState([]); // [{ ...item, _variantId, _qty, _deleted }]

  // variants available theo product_id
  const [variantsCache, setVariantsCache] = useState({}); // { [product_id]: [...variants] }

  // thêm sản phẩm mới
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addVariantId, setAddVariantId] = useState("");
  const [addQty, setAddQty] = useState(1);

  // additions list (sản phẩm mới sẽ thêm)
  const [additions, setAdditions] = useState([]); // [{ product_id, variant_id, quantity, product_name, color_name, color_hex, size, unit_price, image_url }]

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    apiGet(`/api/orders/${id}`)
      .then((data) => {
        if (data.id) {
          setOrder(data);
          setDraftItems(data.items?.map((it) => ({
            ...it,
            _variantId: it.variant_id,
            _qty: it.quantity,
            _deleted: false,
          })) || []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // load variants khi cần
  const loadVariants = async (productId) => {
    if (variantsCache[productId]) return;
    const data = await apiGet(`/api/products/${productId}`);
    setVariantsCache((c) => ({ ...c, [productId]: data.variants || [] }));
  };

  // search sản phẩm
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await apiGet(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        setSearchResults(Array.isArray(data) ? data : []);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSelectProduct = async (product) => {
    await loadVariants(product.id);
    setSelectedProduct(product);
    setAddVariantId("");
    setAddQty(1);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAddItem = () => {
    if (!selectedProduct || !addVariantId || addQty < 1) return;
    const variants = variantsCache[selectedProduct.id] || [];
    const variant = variants.find((v) => v.id === Number(addVariantId));
    if (!variant) return;
    const unitPrice = selectedProduct.sale_price ? Number(selectedProduct.sale_price) : Number(selectedProduct.price);
    setAdditions((prev) => [
      ...prev,
      {
        product_id:   selectedProduct.id,
        variant_id:   Number(addVariantId),
        quantity:     addQty,
        product_name: selectedProduct.name,
        color_name:   variant.color_name,
        color_hex:    variant.color_hex,
        size:         variant.size,
        unit_price:   unitPrice,
        image_url:    selectedProduct.primary_image || null,
        _key:         Date.now(),
      },
    ]);
    setSelectedProduct(null);
    setAddVariantId("");
    setAddQty(1);
    setShowAddPanel(false);
  };

  // tính tổng preview
  const previewSubtotal =
    draftItems
      .filter((it) => !it._deleted)
      .reduce((s, it) => s + Number(it.unit_price) * it._qty, 0) +
    additions.reduce((s, a) => s + a.unit_price * a.quantity, 0);

  const previewTotal = order
    ? previewSubtotal - Number(order.discount_amount) + Number(order.shipping_fee)
    : 0;

  const activeCount = draftItems.filter((it) => !it._deleted).length + additions.length;

  const handleSave = async () => {
    if (activeCount < 1) return;
    setSaving(true);
    try {
      const updates = draftItems
        .filter((it) => !it._deleted && (it._variantId !== it.variant_id || it._qty !== it.quantity))
        .map((it) => ({ item_id: it.id, variant_id: it._variantId, quantity: it._qty }));
      const deletions = draftItems.filter((it) => it._deleted).map((it) => it.id);
      const additionPayload = additions.map(({ product_id, variant_id, quantity }) => ({ product_id, variant_id, quantity }));

      const res = await apiPut(`/api/orders/${id}/items`, { updates, additions: additionPayload, deletions });
      setOrder((prev) => ({
        ...prev,
        items: res.items,
        subtotal: res.subtotal || prev.subtotal,
        total_amount: res.totalAmount || prev.total_amount,

      }));
      setDraftItems(res.items.map((it) => ({ ...it, _variantId: it.variant_id, _qty: it.quantity, _deleted: false })));
      setAdditions([]);
      showToast("✅ Đã lưu thay đổi");
    } catch (err) {
      showToast(err.message || "Lỗi khi lưu", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraftItems(order.items?.map((it) => ({
      ...it, _variantId: it.variant_id, _qty: it.quantity, _deleted: false,
    })) || []);
    setAdditions([]);
  };

  if (loading) return <div className="text-stone-400 text-sm py-10 text-center">Đang tải...</div>;
  if (!order)  return <div className="text-red-500 text-sm py-10 text-center">Không tìm thấy đơn hàng.</div>;

  const isCOD = order.payment_method === "COD";
  const canEdit = ITEM_EDITABLE.includes(order.status);
  const isReadOnly = !canEdit;

  const inputClass = "border border-stone-300 bg-white px-3 py-2 text-sm text-black focus:border-black outline-none";

  return (
    <div>
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 text-sm font-medium shadow-lg rounded
          ${toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-7">
        <button
          onClick={() => router.push(`/admin/orders/${id}`)}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-black uppercase tracking-widest mb-3 transition-colors"
        >
          <ArrowLeft size={12} /> Quay lại đơn {order.order_number}
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-2xl font-black tracking-tight uppercase text-black">
              Sửa sản phẩm — {order.order_number}
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {STATUS_LABELS[order.status]} · {order.payment_method}
            </p>
          </div>
        </div>
      </div>

      {/* Banner mode */}
      {isReadOnly && (
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-4 py-3 mb-6 rounded text-sm text-stone-600">
          <AlertCircle size={15} className="text-stone-400 shrink-0" />
          Không thể chỉnh sửa sản phẩm khi đơn ở trạng thái <strong>&ldquo;{STATUS_LABELS[order.status]}&rdquo;</strong>.
        </div>
      )}
      {!isReadOnly && !isCOD && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-3 mb-6 rounded text-sm text-orange-700">
          <Info size={15} className="shrink-0" />
          Đơn đã thanh toán qua <strong>Sepay</strong> — chỉ có thể đổi variant (màu/size) của từng sản phẩm.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-100 shadow-sm">
            <div className="p-5 border-b border-stone-100">
              <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm">
                Sản phẩm trong đơn
              </h2>
            </div>

            <div className="divide-y divide-stone-50">
              {draftItems.map((item) => (
                <div key={item.id} className={`flex gap-4 px-5 py-4 items-start transition-opacity ${item._deleted ? "opacity-30" : ""}`}>
                  {/* Ảnh */}
                  <div className="w-14 shrink-0 relative overflow-hidden bg-stone-100" style={{ height: "72px" }}>
                    {item.image_url ? (
                      <Image src={getFullUrl(item.image_url)} alt={item.product_name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">N/A</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{Number(item.unit_price).toLocaleString("vi-VN")} đ/sp</p>

                    {!isReadOnly && !item._deleted && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {/* Variant select */}
                        <div>
                          <label className="text-[9px] uppercase tracking-widest text-stone-400 block mb-0.5">Variant</label>
                          <select
                            className={`${inputClass} text-xs`}
                            value={item._variantId || ""}
                            onClick={() => loadVariants(item.product_id)}
                            onChange={(e) => {
                              const vid = Number(e.target.value);
                              setDraftItems((prev) => prev.map((it) =>
                                it.id === item.id ? { ...it, _variantId: vid } : it
                              ));
                            }}
                          >
                            {/* option hiện tại */}
                            <option value={item.variant_id}>{item.color_name} / {item.size} (hiện tại)</option>
                            {(variantsCache[item.product_id] || [])
                              .filter((v) => v.id !== item.variant_id)
                              .map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.color_name} / {v.size} (kho: {v.stock})
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Qty — chỉ COD */}
                        {isCOD && (
                          <div>
                            <label className="text-[9px] uppercase tracking-widest text-stone-400 block mb-0.5">Số lượng</label>
                            <input
                              type="number"
                              min="1"
                              value={item._qty}
                              onChange={(e) => {
                                const q = Math.max(1, parseInt(e.target.value) || 1);
                                setDraftItems((prev) => prev.map((it) =>
                                  it.id === item.id ? { ...it, _qty: q } : it
                                ));
                              }}
                              className={`${inputClass} w-20 text-xs`}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {isReadOnly && (
                      <p className="text-xs text-stone-500 mt-1">{item.color_name} / {item.size} · SL: {item.quantity}</p>
                    )}
                  </div>

                  {/* Subtotal + delete */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <span className="font-bold text-sm text-black">
                      {(Number(item.unit_price) * item._qty).toLocaleString("vi-VN")} đ
                    </span>
                    {!isReadOnly && isCOD && !item._deleted && (
                      <button
                        onClick={() => setDraftItems((prev) => prev.map((it) =>
                          it.id === item.id ? { ...it, _deleted: true } : it
                        ))}
                        className="text-stone-300 hover:text-red-500 transition-colors"
                        title="Xóa item"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    {!isReadOnly && isCOD && item._deleted && (
                      <button
                        onClick={() => setDraftItems((prev) => prev.map((it) =>
                          it.id === item.id ? { ...it, _deleted: false } : it
                        ))}
                        className="text-xs text-stone-400 hover:text-black transition-colors underline"
                      >
                        Khôi phục
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Items mới thêm */}
              {additions.map((add) => (
                <div key={add._key} className="flex gap-4 px-5 py-4 items-start bg-green-50/40">
                  <div className="w-14 shrink-0 relative overflow-hidden bg-stone-100" style={{ height: "72px" }}>
                    {add.image_url ? (
                      <Image src={getFullUrl(add.image_url)} alt={add.product_name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-black text-sm truncate">{add.product_name}</p>
                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">Mới</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{add.color_name} / {add.size} · SL: {add.quantity}</p>
                    <p className="text-xs text-stone-400">{add.unit_price.toLocaleString("vi-VN")} đ/sp</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <span className="font-bold text-sm text-black">{(add.unit_price * add.quantity).toLocaleString("vi-VN")} đ</span>
                    <button
                      onClick={() => setAdditions((prev) => prev.filter((a) => a._key !== add._key))}
                      className="text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Thêm sản phẩm */}
            {!isReadOnly && isCOD && (
              <div className="p-5 border-t border-stone-100">
                {!showAddPanel ? (
                  <button
                    onClick={() => setShowAddPanel(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-black transition-colors"
                  >
                    <Plus size={13} /> Thêm sản phẩm
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Thêm sản phẩm</p>

                    {/* Search */}
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Tìm sản phẩm theo tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`${inputClass} pl-8 w-full`}
                      />
                    </div>

                    {/* Kết quả search */}
                    {searchLoading && <p className="text-xs text-stone-400">Đang tìm...</p>}
                    {searchResults.length > 0 && (
                      <div className="border border-stone-200 divide-y divide-stone-100 max-h-48 overflow-y-auto">
                        {searchResults.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 transition-colors"
                          >
                            <span className="font-medium text-black">{p.name}</span>
                            <span className="text-stone-400 ml-2 text-xs">
                              {(p.sale_price ? Number(p.sale_price) : Number(p.price)).toLocaleString("vi-VN")} đ
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Đã chọn sản phẩm */}
                    {selectedProduct && (
                      <div className="border border-stone-200 p-3 space-y-2 bg-stone-50">
                        <p className="text-sm font-bold text-black">{selectedProduct.name}</p>
                        <div className="flex gap-2 flex-wrap">
                          <div className="flex-1 min-w-[140px]">
                            <label className="text-[9px] uppercase tracking-widest text-stone-400 block mb-0.5">Variant</label>
                            <select
                              value={addVariantId}
                              onChange={(e) => setAddVariantId(e.target.value)}
                              className={`${inputClass} w-full text-xs`}
                            >
                              <option value="">-- Chọn màu/size --</option>
                              {(variantsCache[selectedProduct.id] || []).map((v) => (
                                <option key={v.id} value={v.id} disabled={v.stock < 1}>
                                  {v.color_name} / {v.size} (kho: {v.stock})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] uppercase tracking-widest text-stone-400 block mb-0.5">Số lượng</label>
                            <input
                              type="number"
                              min="1"
                              value={addQty}
                              onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                              className={`${inputClass} w-20 text-xs`}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddItem}
                            disabled={!addVariantId}
                            className="bg-black text-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-40"
                          >
                            Thêm vào đơn
                          </button>
                          <button
                            onClick={() => { setSelectedProduct(null); setAddVariantId(""); setAddQty(1); }}
                            className="px-3 py-1.5 text-xs text-stone-500 hover:text-black transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    {!selectedProduct && (
                      <button
                        onClick={() => { setShowAddPanel(false); setSearchQuery(""); setSearchResults([]); }}
                        className="text-xs text-stone-400 hover:text-black transition-colors"
                      >
                        ✕ Đóng
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: preview tổng + actions */}
        <div className="space-y-4">
          {/* Preview tổng */}
          {!isReadOnly && (
            <div className="bg-white border border-stone-100 shadow-sm p-5">
              <h2 className="font-headline font-bold uppercase tracking-tight text-black mb-4 text-sm">Preview tổng đơn</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-500">Tạm tính (mới)</dt>
                  <dd className="font-medium">{previewSubtotal.toLocaleString("vi-VN")} đ</dd>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Giảm giá</dt>
                    <dd>-{Number(order.discount_amount).toLocaleString("vi-VN")} đ</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-100 pt-2 font-bold">
                  <dt>Tổng (mới)</dt>
                  <dd>{previewTotal.toLocaleString("vi-VN")} đ</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Tổng hiện tại */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black mb-4 text-sm">Tổng hiện tại</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Tạm tính</dt>
                <dd>{Number(order.subtotal).toLocaleString("vi-VN")} đ</dd>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-2 font-bold">
                <dt>Tổng cộng</dt>
                <dd>{Number(order.total_amount).toLocaleString("vi-VN")} đ</dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          {!isReadOnly && (
            <div className="space-y-2">
              {activeCount < 1 && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded flex items-center gap-1.5">
                  <AlertCircle size={12} /> Đơn phải có ít nhất 1 sản phẩm
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={saving || activeCount < 1}
                className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-40"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                onClick={handleReset}
                disabled={saving}
                className="w-full border border-stone-300 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-600 hover:border-stone-500 transition-all disabled:opacity-40"
              >
                Hoàn tác
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
