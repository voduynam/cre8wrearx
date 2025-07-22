import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [year, setYear] = useState(2025);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [totalRevenueRes, monthlyRevenueRes, topProductsRes, ordersRes] =
          await Promise.all([
            axiosInstance.get(`/Orders/revenue?year=${year}`),
            axiosInstance.get(`/Orders/revenue/${year}`),
            axiosInstance.get("/Orders/ordered-products"),
            axiosInstance.get("/Orders"),
          ]);

        // Tổng doanh thu
        const total = totalRevenueRes.data?.revenue || 0;
        setTotalRevenue(total);

        // ✅ Xử lý dữ liệu $values của biểu đồ doanh thu
        const labels =
          monthlyRevenueRes.data?.Labels?.$values ||
          monthlyRevenueRes.data?.labels?.$values ||
          [];

        const values =
          monthlyRevenueRes.data?.Datasets?.$values?.[0]?.Data?.$values ||
          monthlyRevenueRes.data?.datasets?.$values?.[0]?.data?.$values ||
          [];

        const chartData = labels.map((label, idx) => ({
          month: label,
          revenue: values[idx] || 0,
        }));
        setRevenueData(chartData);

        // Sản phẩm được đặt nhiều
        const products = topProductsRes.data?.$values || [];
        setTopProducts(products);

        // Tổng đơn hàng
        const orders = ordersRes.data?.$values || [];
        setTotalOrders(orders.length);
      } catch (err) {
        console.error("Lỗi khi fetch dashboard:", err);
      }
    };

    fetchDashboard();
  }, [year]); // 👈 Gọi lại khi năm thay đổi

  return (
    <div className='min-h-screen bg-gray-100 p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>

        {/* Chọn năm */}
        <div className='flex items-center gap-2'>
          <label htmlFor='year' className='text-gray-600'>
            Chọn năm:
          </label>
          <select
            id='year'
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className='border border-gray-300 rounded px-2 py-1'>
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10'>
        <StatCard
          title={`Tổng doanh thu năm ${year}`}
          value={`₫${totalRevenue.toLocaleString()}`}
        />
        <StatCard title='Tổng số đơn hàng' value={totalOrders} />
      </div>

      {/* Revenue Chart */}
      <div className='bg-white rounded-lg shadow p-6 mb-10'>
        <h2 className='text-xl font-semibold mb-4'>
          Biểu đồ doanh thu theo tháng ({year})
        </h2>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={revenueData}>
            <XAxis dataKey='month' />
            <YAxis
              type='number'
              domain={[0, "auto"]}
              tickFormatter={(value) => `₫${value.toLocaleString("vi-VN")}`}
              tick={{ dx: -10 }} // Dịch số sang trái
              width={90} // Tăng chiều rộng của Y-axis để có chỗ
            />

            <Tooltip formatter={(value) => `₫${value.toLocaleString()}`} />
            <Bar dataKey='revenue' fill='#3182CE' />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>
          Sản phẩm được đặt hàng nhiều
        </h2>
        <table className='w-full text-left border-collapse'>
          <thead className='bg-gray-100 text-gray-700'>
            <tr>
              <th className='py-2 px-3'>#</th>
              <th className='py-2 px-3'>Tên sản phẩm</th>
              <th className='py-2 px-3'>Số lượng đặt</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr
                key={product.product_ID}
                className='border-b hover:bg-gray-50'>
                <td className='py-2 px-3'>{index + 1}</td>
                <td className='py-2 px-3'>{product.ProductName}</td>
                <td className='py-2 px-3'>{product.TotalOrderedQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Card component
const StatCard = ({ title, value }) => (
  <div className='bg-white rounded-lg shadow p-5'>
    <p className='text-gray-500 text-sm mb-1'>{title}</p>
    <p className='text-3xl font-bold text-green-600'>{value}</p>
  </div>
);

export default AdminDashboard;