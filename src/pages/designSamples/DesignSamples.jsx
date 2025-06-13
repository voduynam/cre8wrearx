import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productsSlice";
import { addToCart as addToCartAction } from "../../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Filter, ChevronDown, ChevronUp, ShoppingCart, Eye, Edit } from 'lucide-react';

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
    <div className="min-h-screen bg-black">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-gradient-to-r bg-black backdrop-blur-sm border-b'">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Bộ sưu tập thiết kế
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Khám phá những mẫu thiết kế đẹp mắt và chuyên nghiệp cho dự án của bạn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Search */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-400" />
                  Tìm kiếm
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thiết kế..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Categories Filter */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-xl overflow-hidden">
                <button 
                  className="w-full text-left p-6 hover:bg-slate-700/30 transition-colors border-b border-slate-600/30" 
                  onClick={() => toggleFilter("categories")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-blue-400" />
                      <span className="text-lg font-semibold text-white">Danh mục</span>
                    </div>
                    {openFilter === "categories" ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
                {openFilter === "categories" && (
                  <div className="p-6 pt-0">
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <label 
                          key={category.categoryId} 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                        >
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
                            className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-500 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-white">
                              {category.categoryName}
                            </span>
                          
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-4">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {filteredProducts.length} sản phẩm được tìm thấy
              </h2>
              {selectedFilters.size > 0 && (
                <button
                  onClick={() => setSelectedFilters(new Set())}
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.productId} 
                    className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-800/40 to-slate-700/30 backdrop-blur-sm border border-slate-600/30 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 hover:border-blue-400/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image && product.image.startsWith("http") 
                            ? product.image 
                            : `https://localhost:7163/uploads/${product.image ? product.image.split("\\").pop() : "fallback-image.jpg"}`}
                          alt={product.productName}
                          className="w-full h-72 object-cover transition-all duration-500 group-hover:scale-110"
                          onError={(e) => e.target.src = "/fallback-image.jpg"} 
                        />
                        
                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4">
                          <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <button
                              onClick={() => navigate(`/product/${product.productId}`)}
                              className="flex items-center gap-1 px-3 py-2 bg-slate-800/90 backdrop-blur-sm hover:bg-slate-700 text-white text-sm rounded-lg border border-slate-600/50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Xem chi tiết
                            </button>
                            <button
                              onClick={() => navigate(`/designer?productId=${product.productId}&image=${encodeURIComponent(product.image)}&name=${encodeURIComponent(product.productName)}&price=${product.price}`)}
                              className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Tùy chỉnh
                            </button>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Thêm vào giỏ
                            </button>
                          </div>
                        </div>

                        {/* Price badge */}
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          {product.price.toLocaleString()} VND
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 
                          className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200 cursor-pointer line-clamp-2 mb-2"
                          onClick={() => navigate(`/product/${product.productId}`)}
                        >
                          {product.productName}
                        </h3>
                       <h4 className="text-sm text-gray-300 group-hover:text-blue-300 transition-colors duration-200 line-clamp-2">
  {product.description}
</h4>

                       
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">
                            Mã sản phẩm: #{product.productId.toString().slice(-6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Không tìm thấy sản phẩm nào
                </h3>
                <p className="text-slate-400 mb-4">
                  Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc danh mục
                </p>
                {(searchTerm || selectedFilters.size > 0) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedFilters(new Set());
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSamples;
