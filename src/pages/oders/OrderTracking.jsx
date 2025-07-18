import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
// import "./OrderTracking.css";

// Hàm chuyển đổi key từ PascalCase sang camelCase
function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

const OrderTracking = () => {
  const { role, token } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [customizeProducts, setCustomizeProducts] = useState([]);
  const [orderStages, setOrderStages] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(20);

  // Tính toán các đơn hàng cho trang hiện tại
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchOrderStages();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.User_Id;

      // Lấy thông tin customize products trước
      const customizeResponse = await axiosInstance.get("/customizeproducts");
      const customizeProducts = customizeResponse.data?.$values || [];
      console.log("Customize Products:", customizeProducts);

      // Lấy đơn hàng từ API orders
      const ordersResponse = await axiosInstance.get("/orders");
      console.log("Orders API Response:", ordersResponse.data);

      if (ordersResponse.data?.$values) {
        // Lọc đơn hàng theo userId nếu không phải staff
        let orders = ordersResponse.data.$values;
        if (role !== "staff") {
          orders = orders.filter(order => {
            const customizeProduct = customizeProducts.find(cp => cp.customizeProductId === order.customizeProductId);
            return customizeProduct?.userId === Number(userId);
          });
        }

        // Map customize products vào orders
        const enrichedOrders = orders.map(order => {
          const customizeProduct = customizeProducts.find(
            cp => cp.customizeProductId === order.customizeProductId
          );
          // Không làm mất OrderStages
          return {
            ...order,
            customizeProduct: customizeProduct || {
              customizeProductId: order.customizeProductId,
              productId: order.productId,
              shirtColor: order.shirtColor || "N/A",
              description: order.description || "N/A",
              price: order.price,
              fullImage: order.fullImage
            }
          };
        });

        // Sắp xếp theo ID giảm dần
        const sortedOrders = enrichedOrders.sort((a, b) =>
          b.orderId - a.orderId
        );
    
        // Chuyển đổi key sang camelCase trước khi setOrders
        const camelOrders = toCamelCase(sortedOrders);
        setOrders(camelOrders);
        setCustomizeProducts(customizeProducts);
      } else {
        console.error("Không có dữ liệu đơn hàng hợp lệ");
        setOrders([]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const fetchOrderStages = async () => {
    try {
      const response = await axiosInstance.get("/order-stages");
      if (response.data?.data?.$values) {
        setOrderStages(response.data.data.$values);
      
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải trạng thái đơn hàng:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };


  const getOrderStatusOptions = () => [
    { value: 0, label: "Chờ xử lý" },
    { value: 1, label: "Đã xác nhận" },
    { value: 2, label: "Đang giao" },
    { value: 3, label: "Hoàn thành" }
  ];

  // Sửa lại hàm lấy trạng thái hiện tại cho đúng chuẩn:
  const getOrderStage = (order) => {
    // Ưu tiên lấy từ OrderStages.$values (PascalCase)
    let stages = [];
    if (order.OrderStages && Array.isArray(order.OrderStages.$values)) {
      stages = order.OrderStages.$values;
      // Log từng stage
      stages.forEach((stage, idx) => {
        console.log('OrderId:', order.orderId || order.OrderId, 'Stage', idx, 'OrderStageName:', stage.OrderStageName, 'UpdatedDate:', stage.UpdatedDate);
      });
    }
    // Nếu không có, fallback sang orderStages (camelCase)
    else if (order.orderStages && Array.isArray(order.orderStages)) {
      stages = order.orderStages;
    }
    if (!Array.isArray(stages) || stages.length === 0) return "Chờ xử lý";
    // Sắp xếp giảm dần theo UpdatedDate
    const sortedStages = [...stages].sort((a, b) => new Date(b.UpdatedDate || b.updatedDate) - new Date(a.UpdatedDate || a.updatedDate));
    return sortedStages[0].OrderStageName || sortedStages[0].orderStageName || "Chưa có trạng thái";
  };

  // Sửa lại hàm kiểm tra trạng thái Purchased
  const isPurchased = (orderId) => {
    const stages = orderStages.filter(stage => stage.orderId === orderId);
    return stages.some(stage => stage.orderStageName === "Purchased");
  };

  const getStageStyle = (stage) => {
    switch (stage) {
      case "Chờ xử lý":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Đã xác nhận":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Đang giao":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Hoàn thành":
        return "bg-green-100 text-green-800 border-green-200";
      case "Đã thanh toán":
        return "bg-green-100 text-green-800 border-green-200";
      case "Chưa thanh toán":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Purchased":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatus(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  const handleUpdateStatus = async (orderId) => {
    const newStatus = selectedStatus[orderId];
    if (!newStatus) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/order-stages", {
        orderId: orderId,
        orderStageName: getStatusLabel(newStatus),
        updatedDate: new Date().toISOString()
      });

      if (!response.data) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      await fetchOrderStages();
      await fetchOrders(); // Thêm dòng này nếu cần

      setSelectedStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[orderId];
        return newStatus;
      });

      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Không thể cập nhật trạng thái. Vui lòng thử lại!");
      alert("Có lỗi xảy ra khi cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const option = getOrderStatusOptions().find(opt => opt.value === status);
    return option ? option.label : "Chờ xử lý";
  };

  const [showStageModal, setShowStageModal] = useState(false);
  const [orderStagesDetail, setOrderStagesDetail] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleShowOrderStage = async (orderId) => {
    setSelectedOrderId(orderId);
    setShowStageModal(true);
    try {
      // Gọi API lấy stage theo orderId
      const res = await axiosInstance.get(`/order-stages/${orderId}`);
      // Nếu trả về 1 stage, cho vào mảng; nếu trả về mảng, dùng luôn
      setOrderStagesDetail(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (e) {
      setOrderStagesDetail([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">📦 Danh Sách Đơn Hàng</h1>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {orders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Đặt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người Nhận</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa Chỉ</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản Phẩm</th> */}
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu Sắc</th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương Thức Giao</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Lượng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái đơn</th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => {
                      // Debug log trạng thái stages
                      console.log('OrderId:', order.orderId || order.OrderId, 'OrderStages:', order.OrderStages, 'OrderStages.$values:', order.OrderStages?.$values);
                      return (
                        <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.orderDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.recipientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{order.deliveryAddress}</td>
                        {/* <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {order.customizeProduct?.description || order.description || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customizeProduct?.shirtColor || order.shirtColor || "N/A"}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.shippingMethod || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Intl.NumberFormat('vi-VN').format(order.price || 0)} VND</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(order.totalPrice)} VND</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.notes || "N/A"}</td>

                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageStyle(getOrderStage(order.orderId))}`}>
                            {getOrderStage(order.orderId) || "Chờ xử lý"}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {/* Hiển thị trạng thái hiện tại */}
                            {/* <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageStyle(getOrderStage(order))}`}>
                              {getOrderStage(order) || "Chờ xử lý"}
                            </span> */}
                            {getOrderStage(order) === "Hoàn thành" ? (
                              <span className="text-gray-500 text-sm italic">Đã hoàn thành</span>
                            ) : isPurchased(order.orderId) ? (
                              <span className="text-green-500 text-sm italic">Đã thanh toán</span>
                            ) : (
                              <>
                                <select
                                  className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={selectedStatus[order.orderId] || ""}
                                  onChange={(e) => handleStatusChange(order.orderId, Number(e.target.value))}
                                  disabled={loading}
                                >
                                  <option value="">Chọn trạng thái</option>
                                  {getOrderStatusOptions()
                                    .map(option => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                </select>
                                {selectedStatus[order.orderId] && (
                                  <button
                                    className={`bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => handleUpdateStatus(order.orderId)}
                                    disabled={loading}
                                  >
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    {getOrderStage(order.orderId) === "Hoàn thành" ? (
      <span className="text-gray-500 text-sm italic">Đã hoàn thành</span>
    ) : isPurchased(order.orderId) ? (
      <span className="text-green-500 text-sm italic">Đã thanh toán</span>
    ) : (
      <>
        <select
          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedStatus[order.orderId] || ""}
          onChange={(e) => handleStatusChange(order.orderId, Number(e.target.value))}
          disabled={loading}  
        >
          <option value="">Chọn trạng thái</option>
          {getOrderStatusOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {selectedStatus[order.orderId] && (
          <button
            className={`bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleUpdateStatus(order.orderId)}
            disabled={loading}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        )}
      </>
    )}
  </div>
</td> */}






                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                            onClick={() => navigate(`/order-detail/${order.orderId}`)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{indexOfFirstOrder + 1}</span> đến{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastOrder, orders.length)}
                      </span>{" "}
                      trong tổng số <span className="font-medium">{orders.length}</span> đơn hàng
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      Trước
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${currentPage === index + 1
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              <p className="text-lg">🚫 Không có đơn hàng nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
