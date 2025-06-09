import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productsSlice";
import { addToCart as addToCartAction } from "../../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DesignSamples = () => {
  const dispatch = useDispatch();
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Lấy danh sách sản phẩm từ Redux
  const products = useSelector((state) => state.products.items);
  console.log("All products:", products); // Debug log

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://localhost:7163/api/Category');
        const data = await response.json();
        if (data.status === 1 && data.data.$values) {
          const categoriesData = data.data.$values;
          console.log("Categories loaded with details:", categoriesData.map(cat => ({
            id: cat.categoryId,
            name: cat.categoryName
          })));
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const toggleFilter = (filter) => {
    setOpenFilter(openFilter === filter ? null : filter);
  };

  const toggleOption = (categoryId) => {
    console.log("Toggling category:", categoryId); // Debug log
    setSelectedFilters((prevFilters) => {
      const newFilters = new Set(prevFilters);
      if (newFilters.has(categoryId)) {
        newFilters.delete(categoryId);
      } else {
        newFilters.add(categoryId);
      }
      console.log("New filters:", Array.from(newFilters)); // Debug log
      return newFilters;
    });
  };

  const handleAddToCart = (product) => {
    try {
      dispatch(addToCartAction(product));
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  // Lọc sản phẩm theo từ khóa tìm kiếm & danh mục đã chọn
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    console.log("Product:", product.productName, "CategoryId:", product.categoryId, "Selected filters:", Array.from(selectedFilters)); // Debug log

    if (selectedFilters.size === 0) return matchesSearch;

    const matchesCategory = selectedFilters.has(product.categoryId);
    console.log("Matches category:", matchesCategory); // Debug log
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white p-4">
      <ToastContainer />
      <div className="max-w-7xl mx-auto grid grid-cols-5 gap-6">
        <div className="col-span-1">
          <input
            type="text"
            placeholder="Tìm kiếm thiết kế..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 rounded-md text-black focus:outline-none"
          />
          <div className="mb-4">
            <button 
              className="w-full text-left bg-[#1f1f1f] p-2 rounded-md mb-2 hover:bg-[#333] transition-colors" 
              onClick={() => toggleFilter("categories")}
            >
              DANH MỤC {openFilter === "categories" ? "-" : "+"}
            </button>
            {openFilter === "categories" && (
              <ul className="pl-4">
                {categories.map((category) => (
                  <li key={category.categoryId} className="py-1 flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedFilters.has(category.categoryId)}
                      onChange={() => {
                        console.log("Selecting category:", {
                          id: category.categoryId,
                          name: category.categoryName
                        });
                        toggleOption(category.categoryId);
                      }} 
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {category.categoryName} (ID: {category.categoryId})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Hiển thị danh sách sản phẩm */}
        <div className="col-span-4 grid grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.productId} 
                className="bg-[#1f1f1f] p-4 rounded-md shadow-md hover:scale-105 transition-transform"
              >
                <img
                   src={product.image && product.image.startsWith("http") 
                      ? product.image 
                    : `https://localhost:7163/uploads/${product.image ? product.image.split("\\").pop() : "fallback-image.jpg"}`}
                    alt={product.productName}
                    className="w-full h-60 object-cover rounded-md mb-2 hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => navigate(`/product/${product.productId}`)}
                    onError={(e) => e.target.src = "/fallback-image.jpg"} 
                />

                <h3 
                  className="text-center text-xl mb-2 cursor-pointer hover:text-indigo-400 transition-colors"
                  onClick={() => navigate(`/product/${product.productId}`)}
                >
                  {product.productName}
                </h3>
                <p className="text-center text-lg font-semibold mb-2">{product.price.toLocaleString()} VND</p>
                {/* <button 
                  className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 transition-colors" 
                  onClick={() => handleAddToCart(product)}
                >
                  🛒 Thêm vào giỏ hàng
                </button> */}
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-400">Không tìm thấy sản phẩm nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignSamples;
