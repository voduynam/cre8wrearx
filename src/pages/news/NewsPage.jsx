import React, { useState } from "react";
import { Link } from "react-router-dom";
import c1 from "../../assets copy/c/c1.png";
import c2 from "../../assets copy/c/c2.png";
import c3 from "../../assets copy/c/c3.png";


const articles = [ 
  { id: 1, title: "Nên Chọn Áo Bóng Chày Hay Áo Thun?", image: c1, category: "Áo Lớp" },
  { id: 2, title: "Tổng Hợp Các Mẫu Áo Lớp Polo", image: c2, category: "Áo Lớp" },
  { id: 3, title: "Mẫu Áo Lớp Best-Seller", image: c3, category: "Áo Lớp" },
];

const NewsPage = () => {
  const [selectedCategory] = useState("Áo Lớp");

  const filteredArticles =
    selectedCategory === "Thông tin"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Danh mục */}
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-yellow-400">TIN TỨC ÁO LỚP</h2>
        <div className="flex justify-center space-x-2 mb-6">
         
        </div>

        {/* Danh sách bài viết */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-gray-800 p-4 rounded-lg hover:scale-105 transition-transform">
              <img src={article.image} alt={article.title} className="w-full h-40 object-cover rounded mb-3" />
              <h3 className="text-lg font-semibold text-yellow-400">{article.title}</h3>
              <Link
                to={`/blog/class/${article.id}`}
                className="block mt-3 px-3 py-2 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-600 w-full text-center"
              >
                Đọc tiếp
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
