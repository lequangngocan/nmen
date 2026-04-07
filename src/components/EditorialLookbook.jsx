import Image from "next/image";
import Link from "next/link";

// Biến lưu trữ link hình ảnh cho phần Lookbook
const LOOKBOOK_IMAGES = {
  main: "https://lh3.googleusercontent.com/aida-public/AB6AXuAj_N-5RErndg0UpjTmJQSJGZMILTxTqmAk6pzHHG9b4KZcl0LFaJb1wXBvee-ueqkjDnQ0-53AagrqS_jinnIm9SyBgSQpgUDskWQJzmnbDfN2yFHEb-iwM2ZDLoR89xTuGSZ6ue-o2Rj42K71RHkgskFTujq7A9bHmO4GRtXzUnAN_DYINkEyl8KIbopbsPrztI_bgaVtOSO2Chu8ItbJm19gImYHs3O7DyUfcgbC1U6NKGkx9cLZgGEGGF630bYNk_yweYrFWQ",
  thumb1: "https://lh3.googleusercontent.com/aida-public/AB6AXuDk2ooaAsTzTVIeAzM1gIADxfKHKfqITaszrmsG2nqeyLQUNCjQtVqOyUgAY0xg0asRCCKqiCF3yk0c7vGVUiwsjyE4tlT085jHZxBMBrLbaI9GgIIBl6BGnM_I-4ssPtTKCfGivZ6_rDk8Iziz8oWQUSa95I2Jc5C_CHbyGAXhZ4syWZGvV5OvLJCyJo7HUrmmx7rc28GNlyfOIy_7LLBR9-grQ5X2df-kb8lHYrDwRLWm129RlLmacnsBCdJXPv-R4dsHv7txtQ",
  thumb2: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIlqs9CtM2XQ_tocm13tqCSDq860-kMx1S0rXzXQhPAMEP-OqFWZatZdrytjLWJ3vUH0yhROMafL7fqVQCZjA39878KCgDL64Y8g7pqvGcbQdYrQkJN7v2EtJHpBPEUxBBvzT7aaglYmskhw27AoAxz9nbu2dfh1JMz1KgNzBWCYnxlytuHH6rAk-BYKskMaql9PUfkIIjyf8T41mik3pxdYGEXP7V-5_9NlnkOBMb5XYXlPF-DIEETZREsI_O4ImI8PW6ca1hhg",
  thumb3: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA0Rcg28TdsARYgHn_FMg1g9fBQhj2I7YjONuysJjuEGvcAevBU4HBrwk00SgpiYbLYsj35UEiWdhheaC0yqatrRVHahBuU7fxsLlyX2Mtc4fxetXwU8fIiIlznPQ95wQ3Of6Vk3CvBN5XL8VArX1jFX_HH062z87OBG8njUuCjuCkR9TcFLKlsx3rBKR5RBSvuM9Y3Us5J4ifG1S0m8XxADsGE-PHcJ0Ml9Ew6m0SqKGlYODcvNyMVe3S02e-gbqfgneHHOZHnA",
};

export default function EditorialLookbook() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Tiêu đề phần Editorial */}
        <h2 className="font-headline text-5xl md:text-7xl font-bold uppercase mb-16 text-center text-black">
          BỘ ẢNH
          <br />
          <span className="font-light italic text-stone-500 text-3xl">Ấn bản 04</span>
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
              Bộ sưu tập áo khoác mới tập trung vào sự tối giản và đường may góc cạnh. 
              Mang lại cảm giác kiến trúc sang trọng cho người mặc trong mùa đông năm nay.
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
              href="/editorial/volume-04"
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
