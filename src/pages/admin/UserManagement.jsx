import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Select,
} from "antd";
import axiosInstance from "../../utils/axiosInstance";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // 🔐 Reset password
  const [resetUser, setResetUser] = useState(null);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [resetForm] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users");
      const data = res.data?.$values || [];
      setUsers(data);
    } catch (err) {
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showModal = (user = null) => {
    setEditingUser(user);
    setIsModalVisible(true);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (typeof values.gender === "string") {
        values.gender = values.gender === "true";
      }

      if (editingUser) {
        await axiosInstance.put(`/users/${editingUser.userId}`, values);
        message.success("Cập nhật người dùng thành công");
      } else {
        await axiosInstance.post("/users", values);
        message.success("Thêm người dùng thành công");
      }

      fetchUsers();
      handleCancel();
    } catch (err) {
      message.error("Lỗi xử lý người dùng");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      message.success("Xóa người dùng thành công");
      fetchUsers();
    } catch (err) {
      message.error("Lỗi khi xóa người dùng");
    }
  };

  const showResetModal = (user) => {
    setResetUser(user);
    setResetPasswordModal(true);
    resetForm.resetFields();
  };

  const handleResetPassword = async () => {
    try {
      const { password } = await resetForm.validateFields();
      await axiosInstance.put(`/users/recover/${resetUser.userId}`, {
        newPassword: password,
      });
      message.success("Đặt lại mật khẩu thành công");
      setResetPasswordModal(false);
      fetchUsers();
    } catch {
      message.error("Lỗi khi đặt lại mật khẩu");
    }
  };

  const columns = [
    {
      title: "Tên đăng nhập",
      dataIndex: "Username",
      key: "Username",
      align: "middle",
      ellipsis: true,
    },
    {
      title: "Họ tên",
      dataIndex: "FullName",
      key: "FullName",
      align: "middle",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "Email",
      key: "Email",
      align: "middle",
      ellipsis: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "Phone",
      key: "Phone",
      align: "middle",
      ellipsis: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "Address",
      key: "Address",
      align: "middle",
      ellipsis: true,
    },
    {
      title: "Giới tính",
      dataIndex: "Gender",
      key: "Gender",
      align: "middle",
      render: (gender) => (
        <span className='font-medium text-gray-700'>
          {gender ? "Nam" : "Nữ"}
        </span>
      ),
    },
    // {
    //   title: "Hành động",
    //   key: "action",
    //   align: "middle",
    //   render: (_, record) => (
    //     <div className='flex gap-1 flex-wrap'>
    //       <Button size='small' onClick={() => showModal(record)}>
    //         Sửa
    //       </Button>
    //       <Popconfirm
    //         title='Xác nhận xóa?'
    //         onConfirm={() => handleDelete(record.userId)}>
    //         <Button size='small' danger>
    //           Xóa
    //         </Button>
    //       </Popconfirm>
    //       <Button size='small' onClick={() => showResetModal(record)}>
    //         Reset mật khẩu
    //       </Button>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-800'>Quản lý người dùng</h2>
        <Button type='primary' onClick={() => showModal()}>
          Thêm người dùng
        </Button>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey='userId'
        loading={loading}
        bordered
        pagination={{ pageSize: 8 }}
        className='shadow rounded-md overflow-hidden bg-white'
      />

      {/* Modal Thêm / Sửa */}
      <Modal
        title={editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText='Lưu'
        cancelText='Hủy'>
        <Form layout='vertical' form={form}>
          <Form.Item
            label='Tên đăng nhập'
            name='username'
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập" },
            ]}>
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label='Mật khẩu'
              name='password'
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            label='Họ tên'
            name='fullName'
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label='Email'
            name='email'
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}>
            <Input />
          </Form.Item>

          <Form.Item
            label='Số điện thoại'
            name='phone'
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
            ]}>
            <Input />
          </Form.Item>

          <Form.Item
            label='Địa chỉ'
            name='address'
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label='Giới tính'
            name='gender'
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}>
            <Select placeholder='Chọn giới tính'>
              <Select.Option value={true}>Nam</Select.Option>
              <Select.Option value={false}>Nữ</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal
        title={`Đặt lại mật khẩu cho ${resetUser?.username}`}
        open={resetPasswordModal}
        onOk={handleResetPassword}
        onCancel={() => setResetPasswordModal(false)}
        okText='Cập nhật'
        cancelText='Hủy'>
        <Form layout='vertical' form={resetForm}>
          <Form.Item
            label='Mật khẩu mới'
            name='password'
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;