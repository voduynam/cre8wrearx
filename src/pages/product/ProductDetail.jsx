import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart as addToCartAction } from "../../redux/slices/cartSlice";
import { FaShoppingCart, FaArrowLeft, FaBox, FaTag, FaInfoCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from "../../utils/axiosInstance";

function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      // Giữ nguyên các key đặc biệt như $id, $ref
      if (key.startsWith('$')) {
        result[key] = obj[key];
      } else {
        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        result[camelKey] = toCamelCase(obj[key]);
      }
      return result;
    }, {});
  }
  return obj;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [customDescription, setCustomDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const cartItems = useSelector(state => state.cart.items);

  const shirtColors = [
    "Trắng",
    "Đen",
    "Xám",
    "Đỏ",
    "Xanh dương",
    "Xanh lá",
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details
        const response = await fetch(`https://thisaonao-001-site1.rtempurl.com/api/Product/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Raw API response:", data);

        // Check different possible response structures
        let productData = null;
        
        if (data.status === 1 && data.Data) {
          // Case 1: Response has status and Data field
          productData = data.Data;
        } else if (data.Status === 1 && data.Data) {
          // Case 2: Response has Status (capital S) and Data field
          productData = data.Data;
        } else if (data.ProductId || data.productId) {
          // Case 3: Response is the product data directly
          productData = data;
        } else if (data.data && (data.data.ProductId || data.data.productId)) {
          // Case 4: Response has data field (lowercase)
          productData = data.data;
        } else {
          throw new Error("Không tìm thấy thông tin sản phẩm trong response");
        }

        if (productData) {
          const convertedProduct = toCamelCase(productData);
          console.log("Product after conversion:", convertedProduct);
          setProduct(convertedProduct);
        } else {
          throw new Error("Không tìm thấy thông tin sản phẩm");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("ID sản phẩm không hợp lệ");
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = () => {
    // Bỏ kiểm tra bắt buộc chọn màu áo
    if (cartItems.length > 0) {
      toast.error("⚠️ Bạn chỉ có thể thêm 1 sản phẩm vào giỏ hàng!", { autoClose: 2000 });
      return;
    }

    if (product) {
      try {
        const productWithDetails = {
          ...product,
          productId: product.productId,
          name: product.productName,
          isCustomProduct: true,
          customDescription: customDescription,
          shirtColor: selectedColor, // vẫn truyền nếu có chọn
          description: product.productName,
          image: product.image,
          price: product.price,
          quantity: 1
        };
        console.log("Adding to cart:", productWithDetails);
        dispatch(addToCartAction(productWithDetails));
        toast.success('Đã thêm sản phẩm vào giỏ hàng!');

        setTimeout(() => {
          navigate("/cart");
        }, 1200);

      } catch (err) {
        toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/design/mau-co-san')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-gray-600 mb-6">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => navigate('/design-samples')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FaArrowLeft className="inline mr-2" />
            Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/design-samples')}
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              <FaArrowLeft className="mr-2" />
              Quay lại
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Chi tiết sản phẩm</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Product Image */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={product.image || "/api/placeholder/400/400"}
                  alt={product.productName}
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    e.target.src = "/fallback-image.jpg";
                  }}
                />
              </div>
              {/* Price Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                {product.price?.toLocaleString('vi-VN')}₫
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.productName}
                </h2>
                
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
                    {product.price?.toLocaleString('vi-VN')}₫
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-600">
                    <FaBox className="mr-3 text-orange-500" />
                    <span className="font-medium">Còn lại: {product.stockInStorage} sản phẩm</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <FaInfoCircle className="mr-3 mt-1 text-orange-500 flex-shrink-0" />
                    <span className="leading-relaxed">{product.description}</span>
                  </div>
                </div>
              </div>

         

              {/* Custom Description */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mô tả tùy chỉnh (tùy chọn)
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Nhập mô tả đặc biệt cho sản phẩm của bạn..."
                  rows={4}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all duration-300"
                />
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={cartItems.length > 0}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 ${
                  cartItems.length > 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                <FaShoppingCart className="mr-3" />
                {cartItems.length > 0 ? 'Giỏ hàng đã có sản phẩm' : 'Thêm vào giỏ hàng'}
              </button>

              {/* Product Features */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Đặc điểm sản phẩm</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Chất liệu cao cấp</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Thiết kế hiện đại</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Dễ dàng giặt sạch</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Phù hợp mọi lứa tuổi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;