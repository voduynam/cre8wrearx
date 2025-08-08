import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import axiosInstance from "../../utils/axiosInstance";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPaidOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        "/Orders/filter-paid-orders?paidOnline=true&paidInCash=true"
      );
      const data = res.data?.$values || [];
      setOrders(data);
    } catch (err) {
      message.error("Lỗi khi tải danh sách đơn hàng đã thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaidOrders();
  }, []);

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "OrderId",
      key: "OrderId",
      align: "middle",
    },
    {
      title: "Khách hàng",
      dataIndex: "RecipientName",
      key: "RecipientName",
      align: "middle",
    },
    {
      title: "Số điện thoại",
      dataIndex: "Notes",
      key: "Notes",
      align: "middle",
    },
    {
      title: "Ngày đặt hàng ",
      dataIndex: "OrderDate",
      key: "OrderDate",
      align: "middle",
      render: (text) => (text ? new Date(text).toLocaleDateString() : ""),
    },
    {
      title: "Tiền hàng",
      dataIndex: "TotalPrice",
      key: "TotalPrice",
      align: "middle",
      render: (value) => value?.toLocaleString() + " ₫",
    },
    {
      title: "Ship hàng",
      dataIndex: "ShippingMethod",
      key: "ShippingMethod",
      align: "middle",
      ellipsis: true,
    },
  ];

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h2 className='text-2xl font-bold mb-4 text-gray-800'>
        Danh sách đơn hàng đã thanh toán
      </h2>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey='OrderId'
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        className='shadow rounded-md overflow-hidden bg-white'
      />
    </div>
  );
};

export default OrderManagement;
