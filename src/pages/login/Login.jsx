import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/slices/userSlice";
import { loadUserCart } from "../../redux/slices/cartSlice";
import axiosInstance from "../../utils/axiosInstance";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import xx from '../../assets copy/xx.jpg';




const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoginUrl, setGoogleLoginUrl] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  useEffect(() => {
    // Fetch Google login URL when component mounts
    const fetchGoogleLoginUrl = async () => {
      try {
        const response = await axiosInstance.get("/auth/google-login-url");
        if (response.data) {
          setGoogleLoginUrl(response.data);
          console.log("Fetched Google Login URL:", response.data);
        }
      } catch (error) {
        console.error("Error fetching Google login URL:", error);
      }
    };

    fetchGoogleLoginUrl();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/users/login", {
        username,
        password,
      });

      if (!response.data) {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác!");
      }

      const token = response.data;
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      
      dispatch(setUser({ token, role, username }));
      dispatch(loadUserCart());
      
      // Thêm delay 2 giây trước khi chuyển trang
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (role === "staff") {
        navigate("/order-tracking");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Tài khoản hoặc mật khẩu không chính xác!");
      // Reset password field for security
      setPassword("");
      // Thêm delay 2 giây trước khi xóa thông báo lỗi
      setTimeout(() => {
        setError("");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!username) {
      setError("Vui lòng nhập tên đăng nhập.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await axiosInstance.post("/users/change-password", {
        username,
        password: newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        alert("Mật khẩu đã được cập nhật thành công!");
        setShowResetModal(false);
      } else {
        throw new Error(response.data.message || "Cập nhật mật khẩu thất bại!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    if (googleLoginUrl.url) {
      console.log("Redirecting to Google Login URL:", googleLoginUrl.url);
      // Mở trong popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        googleLoginUrl.url,
        'Google Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } else {
      setError("Không thể kết nối với Google. Vui lòng thử lại sau!");
    }
  };

  return (
    <section className="bg-[#dfa674] min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-[#dfa674] rounded-2xl flex max-w-7xl w-full mx-auto p-12 items-center min-h-[600px] ">
        <div className="w-full md:w-1/2 px-4 md:px-12">
          <h2 className="font-bold text-4xl text-[#915621]">Đăng nhập</h2>
          <p className="text-lg mt-4 text-[#915621]">Nếu bạn đã có tài khoản, hãy đăng nhập ngay.</p>
          
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full mt-6 flex items-center justify-center gap-3 bg-white text-gray-700 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
          >
            <FaGoogle className="text-red-500 h-5 w-5" />
            <span className="font-medium">Đăng nhập với Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#dfa674] text-gray-500">Hoặc đăng nhập với</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-12">
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input
                type="text"
                className="pl-12 pr-4 py-3 w-full border rounded-xl text-lg"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input
                type={showPassword ? "text" : "password"}
                className="pl-12 pr-12 py-3 w-full border rounded-xl text-lg"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash className="h-6 w-6" /> : <FaEye className="h-6 w-6" />}
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md animate-shake">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-red-700 font-medium">
                      {error}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Vui lòng kiểm tra lại thông tin đăng nhập của bạn
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              type="submit"
              className="bg-[#915621] text-white py-3 rounded-xl hover:scale-105 duration-300 hover:bg-[#002c7424] font-medium text-lg"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          <div className="mt-8 text-base border-b border-gray-500 py-6 text-center">
            <button 
              onClick={() => setShowResetModal(true)} 
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="mt-6 text-base flex justify-between items-center">
            <p className="mr-3">Chưa có tài khoản?</p>
            <a href="/register" className="bg-[#915621] text-white py-3 px-8 rounded-xl hover:scale-110 hover:bg-[#002c7424] font-semibold duration-300">Đăng ký</a>
          </div>
        </div>
        <div className="md:block hidden w-1/2 h-full">
          <img className="rounded-2xl w-full h-[550px] object-cover" src={xx} alt="Login illustration" />
        </div>
        {showResetModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Quên mật khẩu</h2>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleResetPassword}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cập nhật mật khẩu
                  </button>
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Login;

