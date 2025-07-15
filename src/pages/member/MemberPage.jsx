import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaVenusMars, FaMapMarkerAlt, FaEdit, FaTimes, FaShoppingBag, FaEye, FaUserCircle, FaHistory } from 'react-icons/fa';

const MemberPage = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Bạn chưa đăng nhập!");
        setLoading(false);
        return;
      }
      try {
        // Lấy profile
        const profileRes = await fetch("https://thisaonao-001-site1.rtempurl.com/api/users/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error("Token hết hạn hoặc không hợp lệ!");
        const profileData = await profileRes.json();
        setProfile(profileData.Data);

        // Lấy orders
        const ordersRes = await fetch("https://thisaonao-001-site1.rtempurl.com/api/Orders/my-order", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!ordersRes.ok) throw new Error("Không thể lấy đơn hàng!");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.$values || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await axiosInstance.get("/Orders/user");
      setOrders(response.data);
    } catch (err) {
      setOrdersError("Không thể tải lịch sử đơn hàng");
      console.error("Lỗi khi tải đơn hàng:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Đổi màu trạng thái sang orange chủ đạo
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "chờ xử lý":
        return "bg-gradient-to-r from-orange-400 to-orange-500 text-white";
      case "đã xác nhận":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white";
      case "đang giao":
        return "bg-gradient-to-r from-orange-300 to-orange-500 text-white";
      case "đã giao":
      case "hoàn thành":
        return "bg-gradient-to-r from-green-600 to-orange-400 text-white";
      case "đã hủy":
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
      case "purchased":
        return "bg-gradient-to-r from-green-500 to-orange-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Bạn chưa đăng nhập!");
      return;
    }

    const formattedData = {
      userId: editData.userId || profile.userId,
      username: editData.username.trim(),
      fullName: editData.fullName.trim(),
      gender: editData.gender === "true",
      dateOfBirth: editData.dateOfBirth ? new Date(editData.dateOfBirth).toISOString() : null,
      address: editData.address.trim(),
      phone: editData.phone.trim(),
      email: editData.email.trim(),
      avatar: editData.avatar,
      isDeleted: editData.isDeleted,
      roleId: editData.roleId,
    };

    try {
      const response = await fetch("https://thisaonao-001-site1.rtempurl.com/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        setError(`Lỗi API: ${errorResponse.message || response.status}`);
        return;
      }

      const updatedData = await response.json();
      if (!updatedData.data || !updatedData.data.userId) {
        setError("Dữ liệu API không hợp lệ!");
        return;
      }
      
      setProfile(updatedData.data);
      setIsEditing(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      setError("Lỗi kết nối API: " + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-orange-500 text-4xl mb-4">⚠️</div>
        <p className="text-orange-600 font-medium text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tài khoản của tôi</h1>
                <p className="text-sm text-gray-500">Quản lý thông tin và đơn hàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden">
          <div className="flex">
            <button
              className={`flex-1 py-6 px-8 text-center font-semibold transition-all duration-300 relative ${
                activeTab === "profile"
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser className="inline-block mr-3 text-lg" />
              Thông tin cá nhân
              {activeTab === "profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              )}
            </button>
            <button
              className={`flex-1 py-6 px-8 text-center font-semibold transition-all duration-300 relative ${
                activeTab === "orders"
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <FaHistory className="inline-block mr-3 text-lg" />
              Lịch sử đơn hàng
              {activeTab === "orders" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              )}
            </button>
          </div>
        </div>

        {activeTab === "profile" ? (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUserCircle className="text-white text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
              <p className="text-gray-500 mt-2">Quản lý thông tin tài khoản của bạn</p>
            </div>

            {isEditing ? (
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Họ và tên", name: "fullName", type: "text", icon: FaUser },
                    { label: "Email", name: "email", type: "email", icon: FaEnvelope },
                    { label: "Số điện thoại", name: "phone", type: "text", icon: FaPhone },
                    { label: "Ngày sinh", name: "dateOfBirth", type: "date", icon: FaCalendar }
                  ].map(({ label, name, type, icon: Icon }) => (
                    <div key={name} className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">{label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Icon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type={type}
                          name={name}
                          value={editData[name] || ""}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500" 
                          placeholder={`Nhập ${label.toLowerCase()}`}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Giới tính</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaVenusMars className="h-5 w-5 text-gray-400" />
                      </div>
                      <select 
                        name="gender" 
                        value={editData.gender} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
                      >
                        <option value="true">Nam</option>
                        <option value="false">Nữ</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">Địa chỉ</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text"
                        name="address"
                        value={editData.address || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 font-medium"
                  >
                    <FaTimes className="inline-block mr-2" />
                    Hủy
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 font-medium"
                  >
                    <FaEdit className="inline-block mr-2" />
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {profile && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <FaUser className="text-orange-500 text-lg" />
                          <div>
                            <p className="text-sm text-gray-500">Họ và tên</p>
                            <p className="font-semibold text-gray-900">{profile.FullName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FaEnvelope className="text-orange-500 text-lg" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold text-gray-900">{profile.Email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FaPhone className="text-orange-500 text-lg" />
                          <div>
                            <p className="text-sm text-gray-500">Số điện thoại</p>
                            <p className="font-semibold text-gray-900">{profile.Phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <FaVenusMars className="text-orange-500 text-lg" />
                          <div>
                            <p className="text-sm text-gray-500">Giới tính</p>
                            <p className="font-semibold text-gray-900">{profile.Gender ? "Nam" : "Nữ"}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FaCalendar className="text-orange-500 text-lg" />
                          <div>
                            <p className="text-sm text-gray-500">Ngày sinh</p>
                            <p className="font-semibold text-gray-900">
                              {profile.DateOfBirth ? new Date(profile.DateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FaMapMarkerAlt className="text-orange-500 text-lg" />
                          <div>
                            <p className="text-sm text-gray-500">Địa chỉ</p>
                            <p className="font-semibold text-gray-900">{profile.Address || "Chưa cập nhật"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <p className="text-sm text-gray-500">Vai trò: <span className="font-semibold text-gray-900">{profile.RoleName}</span></p>
                        </div>
                      
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShoppingBag className="text-white text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h2>
              <p className="text-gray-500 mt-2">Theo dõi tất cả đơn hàng của bạn</p>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
              </div>
            ) : ordersError ? (
              <div className="text-center py-12">
                <div className="text-orange-500 text-4xl mb-4">⚠️</div>
                <p className="text-orange-600 font-medium">{ordersError}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
                <p className="text-gray-400 mt-2">Hãy bắt đầu mua sắm ngay!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  let stageName = "Chưa có trạng thái";
                  let stageColor = "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
                  
                  if (order.OrderStages?.$values?.length) {
                    const sortedStages = [...order.OrderStages.$values].sort((a, b) => 
                        new Date(b.UpdatedDate) - new Date(a.UpdatedDate)
                    );
                    stageName = sortedStages[0].OrderStageName;
                    stageColor = getStatusColor(stageName);
                  }
                  
                  let productName = order.CustomizeProduct?.ProductName || order.CustomizeProduct?.Description || "Sản phẩm tùy chỉnh";
                  if (!productName && order.CustomizeProduct?.Product) {
                    productName = order.CustomizeProduct.Product.ProductName;
                  }
                  
                  return (
                    <div key={order.OrderId} className="bg-gradient-to-r from-white to-orange-50 rounded-xl p-6 border border-orange-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                            <FaShoppingBag className="text-white text-lg" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Đơn hàng #{order.OrderId}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(order.OrderDate).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">
                            {order.TotalPrice?.toLocaleString('vi-VN')} <span className="text-sm text-gray-500">VND</span>
                          </p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stageColor}`}>
                            {stageName}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Sản phẩm</p>
                          <p className="font-medium text-gray-900">{productName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Phương thức giao hàng</p>
                          <p className="font-medium text-gray-900">{order.ShippingMethod || "Chưa chọn"}</p>
                        </div>
                        <div className="flex justify-end">
                          <a 
                            href={`/order-detail/${order.OrderId}`} 
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium"
                          >
                            <FaEye className="mr-2" />
                            Xem chi tiết
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberPage;