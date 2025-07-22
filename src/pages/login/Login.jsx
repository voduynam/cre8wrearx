import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setUser } from "../../redux/slices/userSlice";
import { loadUserCart } from "../../redux/slices/cartSlice";
import axiosInstance from "../../utils/axiosInstance";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import xx from "../../assets copy/xx.jpg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoginUrl, setGoogleLoginUrl] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Reset username and password when component mounts or location changes significantly
  useEffect(() => {
    setUsername("");
    setPassword("");
    setError(""); // Clear any previous errors
  }, [location.pathname]); // Dependency on pathname ensures reset when navigating to /login

  // ✅ Tự động xử lý token Google từ URL nếu có
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role =
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        const derivedUsername = // Use a different variable name to avoid confusion
          payload["name"] ||
          (payload["given_name"] && payload["family_name"]
            ? `${payload["given_name"]} ${payload["family_name"]}`
            : null) ||
          (payload["email"] ? payload["email"].split("@")[0] : null) ||
          "GoogleUser";

        // Log the derived username from Google for debugging
        console.log(
          "Google Login: Derived username from token:",
          derivedUsername
        );

        // Save to storage + redux
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({ role, username: derivedUsername })
        ); // Use derivedUsername here

        dispatch(setUser({ token, role, username: derivedUsername })); // Use derivedUsername here
        dispatch(loadUserCart());

        console.log("✅ Logged in with Google:", {
          role,
          username: derivedUsername,
        });

        // Remove token from URL then redirect
        navigate(role === "staff" ? "/order-tracking" : "/");
      } catch (err) {
        console.error("❌ Token decode error:", err);
        setError("Đăng nhập Google thất bại!");
      }
    }
  }, [location.search, dispatch, navigate]);

  // 🔄 Lấy Google Login URL từ API
  useEffect(() => {
    const fetchGoogleLoginUrl = async () => {
      try {
        const res = await axiosInstance.get("/auth/google-login-url");
        if (res.data) setGoogleLoginUrl(res.data.url || res.data);
      } catch (err) {
        console.error("Không lấy được Google Login URL:", err);
      }
    };

    fetchGoogleLoginUrl();
  }, []);

  // ✅ Xử lý đăng nhập thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/users/login", {
        username, // This 'username' comes from the input field state
        password,
      });
      const token = res.data;

      if (!token) {
        throw new Error("Không nhận được token từ server.");
      }

      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const role =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // Log the username being stored for debugging
      console.log("Regular Login: Storing username:", username);
      localStorage.setItem("user", JSON.stringify({ role, username }));

      dispatch(setUser({ token, role, username }));
      dispatch(loadUserCart());

      navigate(
        role === "staff"
          ? "/order-tracking"
          : role === "admin"
          ? "/admin/dashboard"
          : "/"
      );
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Tài khoản hoặc mật khẩu không chính xác!"
      );
      setPassword(""); // Clear password on failed login
      setTimeout(() => setError(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (googleLoginUrl) {
      window.location.href = googleLoginUrl;
    } else {
      setError("Không thể kết nối với Google. Vui lòng thử lại sau!");
    }
  };

  const handleResetPassword = async () => {
    if (!username) return setError("Vui lòng nhập tên đăng nhập.");
    if (newPassword !== confirmPassword)
      return setError("Mật khẩu xác nhận không khớp!");

    try {
      const res = await axiosInstance.post("/users/change-password", {
        username,
        password: newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        alert("Mật khẩu đã được cập nhật thành công!");
        setShowResetModal(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(res.data.message || "Cập nhật mật khẩu thất bại!");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Lỗi khi cập nhật mật khẩu!"
      );
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#dfa674]'>
      <div className='bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full flex'>
        <div className='w-full md:w-1/2 px-4'>
          <h2 className='text-3xl font-bold text-[#915621]'>Đăng nhập</h2>
          <p className='text-sm text-[#915621] mt-2'>
            Đăng nhập bằng Google hoặc tài khoản
          </p>

          <button
            onClick={handleGoogleLogin}
            className='mt-6 flex items-center justify-center w-full bg-white border py-2 rounded shadow-sm hover:bg-gray-100'>
            <FaGoogle className='text-red-500 mr-2' /> Đăng nhập với Google
          </button>

          <div className='my-4 text-center text-gray-500 text-sm'>Hoặc</div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='relative'>
              <FaUser className='absolute left-3 top-3 text-gray-400' />
              <input
                type='text'
                placeholder='Tên đăng nhập'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className='w-full pl-10 py-2 border rounded'
              />
            </div>

            <div className='relative'>
              <FaLock className='absolute left-3 top-3 text-gray-400' />
              <input
                type={showPassword ? "text" : "password"}
                placeholder='Mật khẩu'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full pl-10 pr-10 py-2 border rounded'
              />
              <span
                className='absolute right-3 top-3 cursor-pointer'
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <div className='text-sm text-red-600'>{error}</div>}

            <button
              type='submit'
              className='w-full bg-[#915621] text-white py-2 rounded hover:bg-[#7a4519] transition'
              disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <button
              type='button'
              className='w-full mt-2 bg-gray-200 text-[#915621] py-2 rounded hover:bg-gray-300 transition font-semibold'
              onClick={() => {
                setUsername(""); // Clear username before navigating
                setPassword(""); // Clear password before navigating
                setError(""); // Clear error before navigating
                navigate("/register");
              }}>
              Đăng ký
            </button>
          </form>

          <div className='mt-4 text-sm'>
            <button
              onClick={() => setShowResetModal(true)}
              className='text-blue-600 hover:underline'>
              Quên mật khẩu?
            </button>
          </div>

          {showResetModal && (
            <div className='mt-4 border-t pt-4'>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Tên đăng nhập'
                className='w-full mb-2 p-2 border rounded'
              />
              <input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='Mật khẩu mới'
                className='w-full mb-2 p-2 border rounded'
              />
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Xác nhận mật khẩu'
                className='w-full mb-2 p-2 border rounded'
              />
              <button
                onClick={handleResetPassword}
                className='w-full bg-blue-600 text-white py-2 rounded'>
                Cập nhật
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className='w-full mt-2 py-2 rounded border'>
                Hủy
              </button>
            </div>
          )}
        </div>

        <div className='hidden md:block w-1/2'>
          <img
            src={xx}
            alt='login'
            className='w-full h-full object-cover rounded-xl'
          />
        </div>
      </div>
    </div>
  );
};

export default Login;