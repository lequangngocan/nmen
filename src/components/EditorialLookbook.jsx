import Image from "next/image";
import Link from "next/link";

// Biến lưu trữ link hình ảnh cho phần Lookbook
const LOOKBOOK_IMAGES = {
  main: "/images/img_61023194.jpg",
  thumb1: "/images/img_74203803.jpg",
  thumb2: "/images/img_6a6a622f.jpg",
  thumb3: "/images/img_0e5ef52b.jpg",
};

export default function EditorialLookbook() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Tiêu đề phần Editorial */}
        <h2 className="font-headline text-5xl md:text-7xl font-bold uppercase mb-16 text-center text-black">
          CÂU CHUYỆN
          <br />
          <span className="font-light italic text-stone-500 text-3xl">Phong Cách</span>
        </h2>

        {/* Chia lưới: Bên trái là ảnh to, bên phải là text và ảnh nhỏ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
          
          {/* Cột trái (Ảnh chính) */}
          <div className="relative aspect-4/5 bg-stone-200 w-full overflow-hidden">
            <Image
              src={LOOKBOOK_IMAGES.main}
              alt="Ảnh chính editorial"
              fill
              className="object-cover"
            />
          </div>

          {/* Cột phải (Nội dung) */}
          <div className="flex flex-col justify-center lg:px-12">
            <p className="font-body text-stone-600 text-lg mb-8 leading-relaxed">
              Hơn cả một bộ trang phục, đây là tuyên ngôn của phái mạnh. Sự kết hợp giữa nghệ thuật cắt may đương đại và những đường nét phóng khoáng mang đến một diện mạo đầy quyền lực nhưng không kém phần tinh tế.
            </p>

            {/* Danh sách 3 ảnh nhỏ chạy dài sang ngang */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
              {[LOOKBOOK_IMAGES.thumb1, LOOKBOOK_IMAGES.thumb2, LOOKBOOK_IMAGES.thumb3].map((thumb, index) => (
                <div key={index} className="w-32 h-44 shrink-0 relative bg-stone-100">
                  <Image
                    src={thumb}
                    alt={`Ảnh chi tiết ${index + 1}`}
                    fill
                    className="object-cover opacity-80 hover:opacity-100"
                  />
                </div>
              ))}
            </div>

            {/* Nút Xem thêm */}
            <Link 
              href="/all"
              className="font-headline text-sm font-bold uppercase tracking-widest text-black underline"
            >
              Xem chi tiết
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
