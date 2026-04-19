// Component card thống kê nhỏ, dùng ở trang Dashboard
export default function StatCard({ title, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 border border-stone-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-stone-500 text-sm">{title}</span>
        <div className={`p-2 rounded ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="font-headline text-3xl font-black text-black">{value}</p>
      {sub && <p className="text-stone-400 text-xs mt-2">{sub}</p>}
    </div>
  );
}
