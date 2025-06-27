// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaUser, FaEnvelope, FaLock, FaUserCircle, FaVenusMars, FaCalendar, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     fullName: '',
//     gender: true, // true: Nam, false: Nữ
//     dateOfBirth: '',
//     address: '',
//     phone: '',
//     avatar: '1',
//     roleName: ''
//   });

//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // Xử lý thay đổi input
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Nếu là giới tính thì chuyển thành kiểu boolean
//     const newValue = name === "gender" ? value === "true" : value;
//     setFormData({ ...formData, [name]: newValue });
//   };

//   // Xử lý đăng ký
//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const response = await fetch('https://phamdangtuc-001-site1.ntempurl.com/api/users', {
//       // const response = await fetch('https://localhost:7163/api/users', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Đăng ký thất bại, vui lòng thử lại!');
//       }

//       alert('Đăng ký thành công!');
//       navigate('/');
//     } catch (err) {
//       setError(err.message || 'Lỗi kết nối đến máy chủ, vui lòng kiểm tra lại!');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             👋 Đăng ký tài khoản
//           </h2>
//         </div>

//         <form onSubmit={handleRegister} className="mt-8 space-y-6">
//           <div className="rounded-md shadow-sm space-y-4">
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaUser className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 name="username"
//                 placeholder="Tên đăng nhập"
//                 value={formData.username}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaEnvelope className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaLock className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Mật khẩu"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaUserCircle className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 name="fullName"
//                 placeholder="Họ và tên"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaVenusMars className="h-5 w-5 text-gray-400" />
//               </div>
//               <select
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white"
//               >
//                 <option value="true">Nam</option>
//                 <option value="false">Nữ</option>
//               </select>
//             </div>

//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaCalendar className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="date"
//                 name="dateOfBirth"
//                 value={formData.dateOfBirth}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 name="address"
//                 placeholder="Địa chỉ"
//                 value={formData.address}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaPhone className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 name="phone"
//                 placeholder="Số điện thoại"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 required
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="rounded-md bg-red-50 p-4">
//               <div className="flex">
//                 <div className="ml-3">
//                   <h3 className="text-sm font-medium text-red-800">{error}</h3>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               Đăng ký
//             </button>
//           </div>
//         </form>

//         <div className="text-center mt-4">
//           <p className="text-sm text-gray-600">
//             Đã có tài khoản?{' '}
//             <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
//               Đăng nhập
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

// import React, { useState } from "react";
// import { FaUser, FaEnvelope, FaLock, FaVenusMars, FaCalendar, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

// const RegisterLogin = () => {
//     const [formData, setFormData] = useState({
//         username: "",
//         email: "",
//         password: "",
//         fullName: "",
//         gender: true,
//         dateOfBirth: "",
//         address: "",
//         phone: "",
//         avatar: "1",
//         roleName: ""
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData({
//             ...formData,
//             [name]: type === "checkbox" ? checked : value,
//         });
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log("Đăng ký thành công!", formData);
//     };

//     return (
//         <div className="bg-gray-100 min-h-screen flex justify-center items-center">
//             <div className="bg-[#dfa674] rounded-2xl flex max-w-3xl p-5 items-center">
//                 {/* Đăng ký */}
//                 <div className="md:w-1/2 px-8">
//                     <h2 className="font-bold text-3xl text-[#002D74]">Đăng Ký</h2>
//                     <p className="text-sm mt-4 text-[#002D74]">Tạo tài khoản mới</p>
//                     <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
//                         <input className="p-2 border rounded-lg" type="text" name="fullName" placeholder="Họ và Tên" value={formData.fullName} onChange={handleChange} required />
//                         <input className="p-2 border rounded-lg" type="text" name="username" placeholder="Tên đăng nhập" value={formData.username} onChange={handleChange} required />
//                         <input className="p-2 border rounded-lg" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
//                         <input className="p-2 border rounded-lg" type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required />
//                         <input className="p-2 border rounded-lg" type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} required />
//                         <input className="p-2 border rounded-lg" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
//                         <select className="p-2 border rounded-lg" name="gender" value={formData.gender} onChange={handleChange}>
//                             <option value={true}>Nam</option>
//                             <option value={false}>Nữ</option>
//                         </select>
//                         <input className="p-2 border rounded-lg" type="text" name="address" placeholder="Địa chỉ" value={formData.address} onChange={handleChange} required />
//                         <button type="submit" className="bg-[#002D74] text-white py-2 rounded-lg hover:scale-105 transition duration-300">Đăng Ký</button>
//                     </form>
//                 </div>
//                 {/* Đăng nhập */}
//                 <div className="md:w-1/2 px-8">
//                     <h2 className="font-bold text-3xl text-[#002D74]">Đăng Nhập</h2>
//                     <p className="text-sm mt-4 text-[#002D74]">Nếu bạn đã có tài khoản, hãy đăng nhập ngay.</p>
//                     <form className="flex flex-col gap-4">
//                         <input className="p-2 mt-8 rounded-xl border" type="email" name="email" placeholder="Email" />
//                         <div className="relative">
//                             <input className="p-2 rounded-xl border w-full" type="password" name="password" placeholder="Mật khẩu" />
//                         </div>
//                         <button className="bg-[#002D74] text-white py-2 rounded-xl hover:scale-105 transition duration-300" type="submit">Đăng Nhập</button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RegisterLogin;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaUser, FaEnvelope, FaLock, FaUserCircle, FaVenusMars, FaCalendar, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

// const RegisterLogin = () => {
//   const [isRegistering, setIsRegistering] = useState(true);
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     fullName: '',
//     gender: true,
//     dateOfBirth: '',
//     address: '',
//     phone: '',
//     avatar: '1',
//     roleName: ''
//   });
//   const [errors, setErrors] = useState({
//     email: "",
//     phone: "",
//   });

//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: name === "gender" ? value === "true" : value });
//     // Kiểm tra email
//     if (name === "email") {
//       const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       setErrors((prev) => ({
//         ...prev,
//         email: emailPattern.test(value) ? "" : "Email không hợp lệ!",
//       }));
//     }

//     // Kiểm tra số điện thoại (phải có 10 số)
//     if (name === "phone") {
//       setErrors((prev) => ({
//         ...prev,
//         phone: /^\d{10}$/.test(value) ? "" : "Số điện thoại phải có đúng 10 chữ số!",
//       }));
//     }
//   };

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setError('');
//      // Kiểm tra nếu còn lỗi thì không submit
//      if (errors.email || errors.phone) {
//       setError("Vui lòng sửa lỗi trước khi tiếp tục!");
//       return;
//     }
//     try {
//       const url = isRegistering ? 'https://phamdangtuc-001-site1.ntempurl.com/api/users' : 'https://phamdangtuc-001-site1.ntempurl.com/api/login';
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Thao tác thất bại, vui lòng thử lại!');
//       }
//       alert(isRegistering ? 'Đăng ký thành công!' : 'Đăng nhập thành công!');
//       navigate('/');
//     } catch (err) {
//       setError(err.message || 'Lỗi kết nối đến máy chủ!');
//     }
//   };

//   return (
//     <section className="bg-gray-100 min-h-screen flex justify-center items-center px-6">
//       <div className="bg-[#dfa674] rounded-2xl flex max-w-3xl p-5 items-center shadow-lg w-full">
//         <div className="w-full md:w-1/2 px-8">
//           <h2 className="font-bold text-3xl text-[#002D74]">{isRegistering ? 'Đăng ký' : 'Đăng nhập'}</h2>
//           <form onSubmit={handleAuth} className="flex flex-col gap-4 mt-4">
//             {isRegistering && (
//               <input type="text" name="username" placeholder="Tên đăng nhập" value={formData.username} onChange={handleChange} className="p-2 rounded-xl border" required />
//             )}
//             <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="p-2 rounded-xl border" required />
//             <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} className="p-2 rounded-xl border" required />
//             {isRegistering && (
//               <>
//                 <input type="text" name="fullName" placeholder="Họ và tên" value={formData.fullName} onChange={handleChange} className="p-2 rounded-xl border" required />
//                 <select name="gender" value={formData.gender} onChange={handleChange} className="p-2 rounded-xl border">
//                   <option value="true">Nam</option>
//                   <option value="false">Nữ</option>
//                 </select>
//                 <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="p-2 rounded-xl border" required />
//                 <input type="text" name="address" placeholder="Địa chỉ" value={formData.address} onChange={handleChange} className="p-2 rounded-xl border" required />
//                 <input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} className="p-2 rounded-xl border" required />
//               </>
//             )}
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <button type="submit" className="bg-[#002D74] text-white py-2 rounded-xl hover:scale-105 duration-300">
//               {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
//             </button>
//           </form>
//           <p className="text-sm mt-4">
//             {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
//             <button onClick={() => setIsRegistering(!isRegistering)} className="text-indigo-600 hover:underline">
//               {isRegistering ? 'Đăng nhập' : 'Đăng ký'}
//             </button>
//           </p>
//         </div>
//         <div className="hidden md:block w-1/2">
//           <img className="rounded-2xl max-h-[600px]" src="https://images.unsplash.com/photo-1552010099-5dc86fcfaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxmcmVzaHxlbnwwfDF8fHwxNzEyMTU4MDk0fDA&ixlib=rb-4.0.3&q=80&w=1080" alt="form background" />
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RegisterLogin;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import xx from "../../assets copy/xx.jpg";

const RegisterLogin = () => {
  const [isRegistering, setIsRegistering] = useState(true);
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
    roleName: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "gender" ? value === "true" : value,
    });

    // Kiểm tra email
    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: emailPattern.test(value) ? "" : "Email không hợp lệ!",
      }));
    }

    // Kiểm tra số điện thoại (phải có 10 số)
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

    // Kiểm tra nếu còn lỗi thì không submit
    if (errors.email || errors.phone) {
      setError("Vui lòng sửa lỗi trước khi tiếp tục!");
      return;
    }

    try {
      const url = isRegistering
        ? "http://hai3004-001-site1.anytempurl.com/api/users"
        : "http://hai3004-001-site1.anytempurl.com/api/login";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Thao tác thất bại, vui lòng thử lại!"
        );
      }

      alert(isRegistering ? "Đăng ký thành công!" : "Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Lỗi kết nối đến máy chủ!");
    }
  };

  return (
    <section className='bg-[#dfa674] min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8'>
      <div className='bg-[#dfa674] rounded-2xl flex max-w-7xl w-full mx-auto p-12 items-center min-h-[600px] '>
        <div className='w-full md:w-1/2 px-4 md:px-12'>
          <h2 className='font-bold text-4xl text-[#915621]'>
            {isRegistering ? "Đăng ký" : "Đăng nhập"}
          </h2>
          <p className='text-lg mt-4 text-[#915621]'>
            {isRegistering
              ? "Tạo tài khoản mới"
              : "Nếu bạn đã có tài khoản, hãy đăng nhập ngay."}
          </p>
          <form onSubmit={handleAuth} className='flex flex-col gap-6 mt-12'>
            {isRegistering && (
              <input
                type='text'
                name='username'
                placeholder='Tên đăng nhập'
                value={formData.username}
                onChange={handleChange}
                className='pl-12 pr-4 py-3 w-full border rounded-xl text-lg'
                required
              />
            )}

            {/* Email */}
            <input
              type='email'
              name='email'
              placeholder='Email'
              value={formData.email}
              onChange={handleChange}
              className='pl-12 pr-4 py-3 w-full border rounded-xl text-lg'
              required
            />
            {errors.email && (
              <p className='text-red-500 text-base'>{errors.email}</p>
            )}

            {/* Password */}
            <input
              type='password'
              name='password'
              placeholder='Mật khẩu'
              value={formData.password}
              onChange={handleChange}
              className='pl-12 pr-4 py-3 w-full border rounded-xl text-lg'
              required
            />

            {isRegistering && (
              <>
                {/* Full Name */}
                <input
                  type='text'
                  name='fullName'
                  placeholder='Họ và tên'
                  value={formData.fullName}
                  onChange={handleChange}
                  className='pl-12 pr-4 py-3 w-full border rounded-xl text-lg'
                  required
                />

                {/* Gender */}
                <select
                  name='gender'
                  value={formData.gender}
                  onChange={handleChange}
                  className='pl-12 pr-4 py-3 w-full border rounded-xl text-lg bg-white'>
                  <option value='true'>Nam</option>
                  <option value='false'>Nữ</option>
                </select>

                {/* Date of Birth */}
                <input
                  type='date'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className='pl-12 pr-4 py-3 w-full border rounded-xl text-lg'
                  required
                />

                {/* Address */}
                <input
                  type='text'
                  name='address'
                  placeholder='Địa chỉ'
                  value={formData.address}
                  onChange={handleChange}
                  className='pl-12 pr-4 py-3 w-full border rounded-xl text-lg'
                  required
                />

                {/* Phone */}
                <input
                  type='text'
                  name='phone'
                  placeholder='Số điện thoại'
                  value={formData.phone}
                  onChange={handleChange}
                  className='pl-12 pr-4 py-3 w-full border rounded-xl text-lg'
                  required
                />
                {errors.phone && (
                  <p className='text-red-500 text-base'>{errors.phone}</p>
                )}
              </>
            )}

            {/* Hiển thị lỗi chung */}
            {error && <p className='text-red-500 text-base'>{error}</p>}

            <button
              type='submit'
              className='bg-[#915621] text-white py-3 rounded-xl hover:scale-105 duration-300 hover:bg-[#002c7424] font-medium text-lg'>
              {isRegistering ? "Đăng ký" : "Đăng nhập"}
            </button>
          </form>

          <div className='mt-8 text-base flex justify-between items-center'>
            <p className='mr-3'>
              {isRegistering ? "Đã có tài khoản?" : "Chưa có tài khoản?"}
            </p>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className='bg-[#915621] text-white py-3 px-8 rounded-xl hover:scale-110 hover:bg-[#002c7424] font-semibold duration-300'>
              {isRegistering ? "Đăng nhập" : "Đăng ký"}
            </button>
          </div>
        </div>

        <div className='md:block hidden w-1/2 h-full'>
          <img
            className='rounded-2xl w-full h-[550px] object-cover'
            src={xx}
            alt='Register illustration'
          />
        </div>
      </div>
    </section>
  );
};

export default RegisterLogin;
