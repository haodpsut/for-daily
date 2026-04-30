import Link from "next/link";

const SITE_NAME = process.env.SITE_NAME ?? "Đỗ Phúc Tộc";

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Về trang chủ</Link>

      <h1 className="serif mt-6 text-4xl font-bold text-stone-900">Giới thiệu</h1>
      <p className="mt-4 text-lg text-stone-700">
        <strong>{SITE_NAME}</strong> là hệ thống số hoá Từ đường — gìn giữ phả hệ, lễ nghi,
        di sản tinh thần và mồ mả của dòng tộc qua nhiều thế hệ.
      </p>

      <h2 className="serif mt-10 text-2xl font-semibold text-stone-900">Năm trụ cột</h2>
      <ul className="mt-4 space-y-3 text-stone-700">
        <li><strong>Phả hệ.</strong> Sơ đồ dòng tộc nhiều đời, hồ sơ cá nhân, xưng hô tự động giữa các thành viên.</li>
        <li><strong>Từ đường.</strong> Lịch giỗ kỵ âm lịch, văn cúng, nghi lễ và báo cáo công đức hàng năm.</li>
        <li><strong>Di sản.</strong> Di huấn, gia phong, câu đối, hoành phi, tư liệu cổ của ông bà để lại.</li>
        <li><strong>Mồ mả.</strong> Vị trí, hình ảnh, lịch sử trùng tu và tảo mộ của từng phần mộ.</li>
        <li><strong>Thư viện.</strong> Hình ảnh dòng tộc qua các thời kỳ.</li>
      </ul>

      <h2 className="serif mt-10 text-2xl font-semibold text-stone-900">Triết lý</h2>
      <p className="mt-4 text-stone-700">
        Dữ liệu của dòng họ là <em>của dòng họ</em>. App này được self-host hoàn toàn — không phụ thuộc
        bên thứ ba, không gửi dữ liệu ra ngoài, có thể export thành file JSON đọc tay được bất cứ lúc nào.
      </p>

      <h2 className="serif mt-10 text-2xl font-semibold text-stone-900">Trạng thái phát triển</h2>
      <p className="mt-4 text-stone-700">
        <strong>Sprint 1 / 8</strong> — Foundation: schema, dữ liệu mẫu, công cụ import/export đã sẵn sàng.
        Các module hiển thị (phả hệ, từ đường, di sản, mồ mả, thư viện) sẽ mở dần qua các sprint sau.
      </p>

      <p className="mt-10 text-sm text-stone-500">
        Mã nguồn:{" "}
        <a
          href="https://github.com/haodpsut/for-daily/tree/main/gia-pha-do-phuc-toc-v2"
          className="underline hover:text-stone-900"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/haodpsut/for-daily
        </a>{" "}
        · License MIT
      </p>
    </main>
  );
}
