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

  // ✅ Fetch users - giữ nguyên
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

      // Convert gender string to boolean if needed
      if (typeof values.gender === "string") {
        values.gender = values.gender === "true";
      }

      if (editingUser) {
        console.log("Editing ID:", editingUser.userId); // ✅ Debug ID

        await axiosInstance.put(`/users/${editingUser.userId}`, values);
        message.success("Cập nhật người dùng thành công");
      } else {
        await axiosInstance.post("/users", values); // 🔁 không có "/api"
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

  const columns = [
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (gender) => (gender ? "Nam" : "Nữ"),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <>
          <Button type='link' onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title='Xác nhận xóa?'
            onConfirm={() => handleDelete(record.userId)}>
            <Button type='link' danger>
              Xoá
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold'>Quản lý người dùng</h2>
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
      />

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
    </div>
  );
};

export default UserManagement;
