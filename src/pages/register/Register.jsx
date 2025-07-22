import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenusMars,
} from "react-icons/fa";
import xx from "../../assets copy/xx.jpg";

const RegisterLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    gender: true,
    dateOfBirth: "",
    address: "",
    phone: "",
    avatar: "1",
    roleName: "customer",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "gender" ? value === "true" : value,
    }));

    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: emailPattern.test(value) ? "" : "Email không hợp lệ!",
      }));
    }

    if (name === "phone") {
      setErrors((prev) => ({
        ...prev,
        phone: /^\d{10}$/.test(value)
          ? ""
          : "Số điện thoại phải có đúng 10 chữ số!",
      }));
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    if (errors.email || errors.phone) {
      setError("Vui lòng sửa lỗi trước khi tiếp tục!");
      return;
    }

    try {
      const url = "https://thisaonao-001-site1.rtempurl.com/api/users"; // This component is now solely for registration
      const payload = formData;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Thao tác thất bại, vui lòng thử lại!"
        );
      }

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login"); // Redirect to the dedicated Login page after successful registration
    } catch (err) {
      setError(err.message || "Lỗi kết nối đến máy chủ!");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#dfa674]'>
      <div className='bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full flex'>
        <div className='w-full md:w-1/2 px-4'>
          <h2 className='text-3xl font-bold text-[#915621]'>Đăng ký</h2>
          <p className='text-sm text-[#915621] mt-2'>
            Tạo tài khoản mới của bạn
          </p>

          <form onSubmit={handleAuth} className='space-y-4 mt-6'>
            <div className='relative'>
              <FaUser className='absolute left-3 top-3 text-gray-400' />
              <input
                type='text'
                name='username'
                placeholder='Tên đăng nhập'
                value={formData.username}
                onChange={handleChange}
                className='w-full pl-10 py-2 border rounded'
                required
              />
            </div>

            <div className='relative'>
              <FaEnvelope className='absolute left-3 top-3 text-gray-400' />
              <input
                type='email'
                name='email'
                placeholder='Email'
                value={formData.email}
                onChange={handleChange}
                className='w-full pl-10 py-2 border rounded'
                required
              />
              {errors.email && (
                <p className='text-sm text-red-600 mt-1'>{errors.email}</p>
              )}
            </div>

            <div className='relative'>
              <FaLock className='absolute left-3 top-3 text-gray-400' />
              <input
                type={showPassword ? "text" : "password"}
                name='password'
                placeholder='Mật khẩu'
                value={formData.password}
                onChange={handleChange}
                className='w-full pl-10 pr-10 py-2 border rounded'
                required
              />
              <span
                className='absolute right-3 top-3 cursor-pointer'
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className='relative'>
              <FaUser className='absolute left-3 top-3 text-gray-400' />
              <input
                type='text'
                name='fullName'
                placeholder='Họ và tên'
                value={formData.fullName}
                onChange={handleChange}
                className='w-full pl-10 py-2 border rounded'
                required
              />
            </div>

            <div className='relative'>
              <FaVenusMars className='absolute left-3 top-3 text-gray-400' />
              <select
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-2 border rounded bg-white'>
                <option value='true'>Nam</option>
                <option value='false'>Nữ</option>
              </select>
            </div>

            <div className='relative'>
              <FaCalendarAlt className='absolute left-3 top-3 text-gray-400' />
              <input
                type='date'
                name='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleChange}
                className='w-full pl-10 py-2 border rounded'
                required
              />
            </div>

            <div className='relative'>
              <FaMapMarkerAlt className='absolute left-3 top-3 text-gray-400' />
              <input
                type='text'
                name='address'
                placeholder='Địa chỉ'
                value={formData.address}
                onChange={handleChange}
                className='w-full pl-10 py-2 border rounded'
                required
              />
            </div>

            <div className='relative'>
              <FaPhone className='absolute left-3 top-3 text-gray-400' />
              <input
                type='text'
                name='phone'
                placeholder='Số điện thoại'
                value={formData.phone}
                onChange={handleChange}
                className='w-full pl-10 py-2 border rounded'
                required
              />
              {errors.phone && (
                <p className='text-sm text-red-600 mt-1'>{errors.phone}</p>
              )}
            </div>

            {error && <div className='text-sm text-red-600'>{error}</div>}

            <button
              type='submit'
              className='w-full bg-[#915621] text-white py-2 rounded hover:bg-[#7a4519] transition'>
              Đăng ký
            </button>
          </form>

          <div className='mt-4 text-sm flex justify-center'>
            <button
              onClick={() => navigate("/login")} // This will now navigate to your dedicated Login page
              className='text-blue-600 hover:underline'>
              Đã có tài khoản? Đăng nhập
            </button>
          </div>
        </div>

        <div className='hidden md:block w-1/2'>
          <img
            src={xx}
            alt='illustration'
            className='w-full h-full object-cover rounded-xl'
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterLogin;