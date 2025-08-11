import React, { useEffect, useState } from "react";
import { Table, message, Radio } from "antd";
import axiosInstance from "../../utils/axiosInstance";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("online"); // "online" hoặc "cash"

  const fetchOrders = async (type) => {
    setLoading(true);
    try {
      const paidOnline = type === "online";
      const paidInCash = type === "cash";

      const res = await axiosInstance.get(
        `/Orders/filter-paid-orders?paidOnline=${paidOnline}&paidInCash=${paidInCash}`
      );
      const ordersData = res.data?.$values || [];

      const detailedOrders = await Promise.all(
        ordersData.map(async (order) => {
          const detailRes = await axiosInstance.get(`/Orders/${order.OrderId}`);
          const details = detailRes.data?.OrderDetails?.$values || [];
          return {
            ...order,
            Products: details
              .map((d) => d.ProductName || d.ProductId)
              .join(", "),
          };
        })
      );

      setOrders(detailedOrders);
    } catch (err) {
      message.error("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(paymentFilter);
  }, [paymentFilter]);

  const columns = [
    { title: "Mã đơn hàng", dataIndex: "OrderId", key: "OrderId" },
    { title: "Khách hàng", dataIndex: "RecipientName", key: "RecipientName" },
    {
      title: "Sản phẩm",
      dataIndex: "Products",
      key: "Products",
      render: (text) => (text ? text : "Sản phẩm thiết kế"),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "OrderDate",
      key: "OrderDate",
      render: (text) => (text ? new Date(text).toLocaleDateString() : ""),
    },
    {
      title: "Tiền hàng",
      dataIndex: "TotalPrice",
      key: "TotalPrice",
      render: (value) => value?.toLocaleString() + " ₫",
    },
    {
      title: "Giao hàng",
      dataIndex: "ShippingMethod",
      key: "ShippingMethod",
    },
  ];

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h2 className='text-2xl font-bold mb-4'>
        Danh sách đơn hàng đã thanh toán
      </h2>

      <Radio.Group
        value={paymentFilter}
        onChange={(e) => setPaymentFilter(e.target.value)}
        style={{ marginBottom: 16 }}>
        <Radio.Button value='online'>Thanh toán Online</Radio.Button>
        <Radio.Button value='cash'>Thanh toán Tiền mặt</Radio.Button>
      </Radio.Group>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey='OrderId'
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default OrderManagement;
