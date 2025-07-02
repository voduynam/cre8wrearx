import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaVenusMars, FaMapMarkerAlt, FaEdit, FaTimes } from 'react-icons/fa';

const MemberPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    fetchProfile();
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Bạn chưa đăng nhập!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://hai3004-001-site1.anytempurl.com/api/users/profile", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
      
      const data = await response.json();
      if (!data?.data) throw new Error("Dữ liệu API không hợp lệ!");
      
      setProfile(data.data);
      setEditData({
        userId: data.data.userId ?? 0,
        username: data.data.username || "",
        fullName: data.data.fullName || "",
        gender: data.data.gender ? "true" : "false",
        dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.split("T")[0] : "",
        address: data.data.address || "",
        phone: data.data.phone || "",
        email: data.data.email || "",
        avatar: data.data.avatar || "",
        isDeleted: data.data.isDeleted ?? false,
        roleId: data.data.roleId ?? 3,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
  

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "chờ xử lý":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "đã xác nhận":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "đang giao":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "đã giao":
        return "bg-green-100 text-green-800 border-green-200";
      case "đã hủy":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      const response = await fetch("https://phamdangtuc-001-site1.ntempurl.com/api/users/profile", {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                activeTab === "profile"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Thông tin cá nhân
            </button>
            {/* <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                activeTab === "orders-stage"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("orders-stage")}
            >
              Lịch sử đơn hàng
            </button> */}
          </div>
        </div>

        {activeTab === "profile" ? (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Thông tin cá nhân</h2>
            {isEditing ? (
              <div className="space-y-4">
                {[
                  { label: "Họ và tên", name: "fullName", type: "text", icon: FaUser },
                  { label: "Email", name: "email", type: "email", icon: FaEnvelope },
                  { label: "Số điện thoại", name: "phone", type: "text", icon: FaPhone },
                  { label: "Ngày sinh", name: "dateOfBirth", type: "date", icon: FaCalendar }
                ].map(({ label, name, type, icon: Icon }) => (
                  <div key={name} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input 
                      type={type}
                      name={name}
                      value={editData[name] || ""}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors duration-200 font-sans text-base text-center" 
                    />
                  </div>
                ))}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaVenusMars className="h-5 w-5 text-gray-400" />
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  <select 
                    name="gender" 
                    value={editData.gender} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors duration-200 font-sans text-base text-center"
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input 
                    type="text"
                    name="address"
                    value={editData.address || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors duration-200 font-sans text-base text-center"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 font-sans text-sm"
                  >
                    <FaTimes className="inline-block mr-2" />
                    Hủy
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 font-sans text-sm"
                  >
                    <FaEdit className="inline-block mr-2" />
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {profile && (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaUser className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Họ và tên</p>
                        <p className="font-medium text-gray-900">{profile.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium text-gray-900">{profile.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaCalendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày sinh</p>
                        <p className="font-medium text-gray-900">
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaVenusMars className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Giới tính</p>
                        <p className="font-medium text-gray-900">{profile.gender ? "Nam" : "Nữ"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p className="font-medium text-gray-900">{profile.address}</p>
                      </div>
                    </div>
                  </>
                )}
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <FaEdit className="inline-block mr-2" />
                  Chỉnh sửa thông tin
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Lịch sử đơn hàng</h2>
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
              </div>
            ) : ordersError ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-xl mb-4">⚠️</div>
                <p className="text-red-600 font-medium">{ordersError}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-xl mb-4">📦</div>
                <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đặt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người nhận
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Địa chỉ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.recipientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.deliveryAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {order.totalPrice?.toLocaleString('vi-VN')} VND
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status || "Chờ xử lý"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberPage;
