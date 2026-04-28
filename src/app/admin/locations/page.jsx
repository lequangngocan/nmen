"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, ChevronRight, Search } from "lucide-react";

export default function AdminLocationsPage() {
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [searchProvince, setSearchProvince] = useState("");
  const [searchCommune, setSearchCommune] = useState("");

  // load tỉnh khi vào trang
  useEffect(() => {
    fetch("http://localhost:5000/api/locations/provinces")
      .then((r) => r.json())
      .then((data) => {
        setProvinces(data);
        setLoadingProvinces(false);
      })
      .catch(() => setLoadingProvinces(false));
  }, []);

  // load xã/phường khi chọn tỉnh
  const handleSelectProvince = (province) => {
    if (selectedProvince?.id === province.id) {
      setSelectedProvince(null);
      setCommunes([]);
      return;
    }
    setSelectedProvince(province);
    setCommunes([]);
    setSearchCommune("");
    setLoadingCommunes(true);
    fetch(`http://localhost:5000/api/locations/provinces/${province.id}/communes`)
      .then((r) => r.json())
      .then((data) => {
        setCommunes(data);
        setLoadingCommunes(false);
      })
      .catch(() => setLoadingCommunes(false));
  };

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(searchProvince.toLowerCase())
  );

  const filteredCommunes = communes.filter((c) =>
    c.name.toLowerCase().includes(searchCommune.toLowerCase())
  );

  // đếm số phường/xã theo loại
  const countByLevel = (list, level) =>
    list.filter((c) => c.level && c.level.includes(level)).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MapPin size={22} className="text-stone-600" />
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Địa lý</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Dữ liệu hành chính 2 cấp theo Nghị quyết 202/2025 — cập nhật từ Cục Thống Kê
          </p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Tỉnh / Thành phố</p>
          <p className="text-3xl font-bold text-stone-900">{provinces.length}</p>
        </div>
        {selectedProvince && (
          <>
            <div className="bg-white border border-stone-200 rounded-lg p-4">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Xã / Phường</p>
              <p className="text-3xl font-bold text-stone-900">{communes.length}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-lg p-4">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Phường / Xã / Khác</p>
              <p className="text-sm text-stone-700 font-medium mt-2">
                {countByLevel(communes, "Phường")} Phường &nbsp;·&nbsp;
                {countByLevel(communes, "Xã")} Xã
              </p>
            </div>
          </>
        )}
      </div>

      {/* 2 cột: Tỉnh | Xã/Phường */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* CỘT TRÁI: Danh sách tỉnh */}
        <div className="md:col-span-2 bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
              Tỉnh / Thành phố ({filteredProvinces.length})
            </p>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm tỉnh..."
                value={searchProvince}
                onChange={(e) => setSearchProvince(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[560px]">
            {loadingProvinces ? (
              <div className="p-6 text-center text-sm text-stone-400">Đang tải...</div>
            ) : (
              <ul>
                {filteredProvinces.map((p) => {
                  const isSelected = selectedProvince?.id === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => handleSelectProvince(p)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors border-b border-stone-50 ${
                          isSelected
                            ? "bg-stone-900 text-white"
                            : "text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <span className="font-medium truncate pr-2">{p.name}</span>
                        {isSelected ? (
                          <ChevronDown size={14} className="shrink-0" />
                        ) : (
                          <ChevronRight size={14} className="shrink-0 text-stone-400" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Danh sách xã/phường */}
        <div className="md:col-span-3 bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            {selectedProvince ? (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">
                  {selectedProvince.name}
                </p>
                <div className="relative mt-3">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Tìm xã/phường..."
                    value={searchCommune}
                    onChange={(e) => setSearchCommune(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-sm border border-stone-200 rounded focus:outline-none focus:border-stone-400"
                  />
                </div>
              </>
            ) : (
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
                ← Chọn tỉnh để xem xã/phường
              </p>
            )}
          </div>

          <div className="overflow-y-auto max-h-[560px]">
            {!selectedProvince ? (
              <div className="p-10 text-center">
                <MapPin size={36} className="mx-auto text-stone-200 mb-3" />
                <p className="text-sm text-stone-400">Chọn một tỉnh/thành phố để xem danh sách xã/phường</p>
              </div>
            ) : loadingCommunes ? (
              <div className="p-6 text-center text-sm text-stone-400">Đang tải...</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-stone-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500">Mã</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500">Tên</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500">Loại</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommunes.map((c) => (
                    <tr key={c.id} className="border-t border-stone-50 hover:bg-stone-50">
                      <td className="px-4 py-2.5 font-mono text-xs text-stone-400">{c.code}</td>
                      <td className="px-4 py-2.5 text-stone-800 font-medium">{c.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          c.level === "Phường"
                            ? "bg-blue-50 text-blue-600"
                            : c.level === "Xã"
                            ? "bg-green-50 text-green-600"
                            : "bg-stone-100 text-stone-500"
                        }`}>
                          {c.level || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Ghi chú nguồn */}
      <p className="mt-6 text-xs text-stone-400 text-center">
        Nguồn dữ liệu: <a href="https://addresskit.cas.so" target="_blank" rel="noreferrer" className="underline hover:text-stone-600">Cas AddressKit</a>
        &nbsp;·&nbsp; Hiệu lực từ 01/07/2025 theo Nghị quyết 202/2025/QH15
      </p>
    </div>
  );
}
