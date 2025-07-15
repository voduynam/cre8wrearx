import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShoppingBag, FaUser, FaMapMarkerAlt, FaBoxOpen, FaMoneyBillWave, FaTruck, FaPhone } from 'react-icons/fa';

const OrderDetailSimple = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://thisaonao-001-site1.rtempurl.com/api/Orders/my-order", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Không thể lấy danh sách đơn hàng!");
        const data = await res.json();
        const found = (data.$values || []).find(o => String(o.OrderId) === String(orderId));
        if (!found) throw new Error("Không tìm thấy đơn hàng này!");
        setOrder(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải chi tiết đơn hàng...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-orange-500 text-4xl mb-4">⚠️</div>
        <p className="text-orange-600 font-medium text-lg">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <FaArrowLeft className="inline-block mr-2" /> Quay lại
        </button>
      </div>
    </div>
  );
  if (!order) return null;

  // Lấy trạng thái mới nhất
  let stageName = "Chưa có trạng thái";
  if (order.OrderStages?.$values?.length) {
    const sortedStages = [...order.OrderStages.$values].sort((a, b) => new Date(b.UpdatedDate) - new Date(a.UpdatedDate));
    stageName = sortedStages[0].OrderStageName;
  }
  let productName = order.CustomizeProduct?.ProductName || order.CustomizeProduct?.Description || "Sản phẩm tùy chỉnh";
  if (!productName && order.CustomizeProduct?.Product) {
    productName = order.CustomizeProduct.Product.ProductName;
  }
  // Lấy tổng tiền đã thanh toán online (nếu có payments)
  const getOnlinePaidAmount = () => {
    if (!order.Payments?.$values?.length) return 0;
    return order.Payments.$values.reduce((sum, p) => sum + (p.DepositPaid || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-orange-600 hover:underline font-medium">
          <FaArrowLeft className="mr-2" /> Quay lại
        </button>
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-4">
            <FaShoppingBag className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.OrderId}</h1>
            <p className="text-gray-500">Ngày đặt: {new Date(order.OrderDate).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center text-gray-700"><FaUser className="mr-2 text-orange-500" /> <b>Người nhận:</b> {order.RecipientName}</div>
            <div className="flex items-center text-gray-700"><FaMapMarkerAlt className="mr-2 text-orange-500" /> <b>Địa chỉ:</b> {order.DeliveryAddress}</div>
            <div className="flex items-center text-gray-700"><FaPhone className="mr-2 text-orange-500" /> <b>SĐT:</b> {order.Notes}</div>
            <div className="flex items-center text-gray-700"><FaTruck className="mr-2 text-orange-500" /> <b>Phương thức giao:</b> {order.ShippingMethod}</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700"><FaBoxOpen className="mr-2 text-orange-500" /> <b>Sản phẩm:</b> {productName}</div>
            <div className="flex items-center text-gray-700"><FaMoneyBillWave className="mr-2 text-orange-500" /> <b>Tổng tiền:</b> {order.TotalPrice?.toLocaleString('vi-VN')} VND</div>
            <div className="flex items-center text-gray-700"><b>Trạng thái:</b> <span className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white text-sm font-semibold">{stageName}</span></div>
            <div className="flex items-center text-gray-700"><b>Số lượng:</b> <span className="ml-2">{order.Quantity}</span></div>
            <div className="flex items-center text-gray-700"><b>Đã thanh toán online:</b> <span className="ml-2">{getOnlinePaidAmount().toLocaleString('vi-VN')} VND</span></div>
          </div>
        </div>
        {order.CustomizeProduct?.FullImage && (
          <div className="mb-8 text-center">
            <img src={order.CustomizeProduct.FullImage} alt="Ảnh sản phẩm" className="inline-block rounded-xl shadow max-h-64" />
            <div className="mt-2 text-sm text-gray-500">Ảnh sản phẩm tuỳ chỉnh</div>
          </div>
        )}
        <div className="text-right">
          <span className="text-gray-500 text-sm">Mã đơn hàng: {order.OrderId}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailSimple; 