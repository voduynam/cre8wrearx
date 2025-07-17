

// export default Cart;

import React, { useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { removeFromCart, clearCart, updateQuantity } from "../../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from "sweetalert2";
import { Trash } from "lucide-react";
import { useMemo } from "react";

const Cart = () => {
  const cartItems = useSelector((state) => state.cart?.items ?? [], shallowEqual);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // State lưu số lượng cho từng sản phẩm phải mua 10 sản phẩm
  // const [quantities, setQuantities] = useState(
  //   cartItems.reduce((acc, item) => ({ ...acc, [item.productId]: item.quantity }), {})
  // );
  const [quantities, setQuantities] = useState(
    cartItems.reduce(
      (acc, item) => ({ ...acc, [item.productId]: Math.max(item.quantity, 1) }),
      {}
    )
    
    
  );
  
  console.log("lllllll",cartItems);
  const [recipientName, setRecipientName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [shippingMethod, setShippingMethod] = useState("Giao thường");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [orderStage, setOrderStage] = useState("Chờ xử lý");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [qrInfo, setQrInfo] = useState(null);

  //Hỏi trước khi xoá sản phẩm
  const handleRemoveItem = (productId) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Sản phẩm này sẽ bị xóa khỏi giỏ hàng!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFromCart(String(productId))); // ép về chuỗi
        Swal.fire("Đã xóa!", "Sản phẩm đã được xóa khỏi giỏ hàng.", "success");
      }
    });
  };

  // Tính phí ship
  const shippingFee = shippingMethod === "Giao nhanh" ? 10000 : 0;

  // Tính tổng tiền bao gồm cả phí ship
  // const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + shippingFee;
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + shippingFee;
  }, [cartItems, shippingFee]);
  



  const handleQuantityChange = (productId, newQuantity) => {
    const updatedQuantity = Math.max(newQuantity, 1); // Đảm bảo số lượng tối thiểu là 10

    setQuantities((prev) => ({
      ...prev,
      [productId]: updatedQuantity
    }));

    dispatch(updateQuantity({ 
      productId, 
      quantity: updatedQuantity,
      // totalPrice: updatedQuantity * getProductPrice(productId) // Cập nhật totalPrice
    }));
};

  
  // Xử lý thanh toán VNPAY
  const handleVNPayPayment = async (orderId) => {
    try {
      const amount = totalPrice;
      const response = await fetch(`https://thisaonao-001-site1.rtempurl.com/Payment/VietQR/generate-qr?orderId=${orderId}&amount=${amount}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json(); // Đổi sang .json() để lấy object
      console.log("VNPAY Response:", data);

      if (data.qrImageUrl) {
        setQrInfo(data); // Lưu lại thông tin QR để hiển thị
        setShowStatus(false); // Ẩn popup "Đang xử lý đơn hàng..."
        setOrderStatus("waiting_payment"); // Nếu muốn hiển thị trạng thái khác
      } else {
        throw new Error("Không nhận được URL QR hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi tạo URL thanh toán:", error);
      alert("Không thể tạo link thanh toán. Vui lòng thử lại!");
    }
  };

  // Xử lý đặt hàng
  const handleCheckout = async () => {
    if (!recipientName || !deliveryAddress || !shippingMethod) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    setIsLoading(true);
    setOrderStatus("processing");
    setShowStatus(true);

    try {
      const tokenPayload = JSON.parse(atob(user.token.split('.')[1]));
      const userId = tokenPayload.User_Id;

      // Lấy sản phẩm từ giỏ hàng
      const customProduct = cartItems[0];
      
      const orderData = {
        productId: customProduct.productId,
        userId: Number(userId),
        shirtColor: customProduct.shirtColor || "N/A",
        description: customProduct.customDescription || "",
        customDescription: customProduct.customDescription || "",
        recipientName: recipientName,
        deliveryAddress: deliveryAddress,
        shippingMethod: shippingMethod,
        shippingFee: shippingMethod === "Giao nhanh" ? 10000 : 0,
        notes: notes || "",
        quantity: customProduct.quantity,
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fullImage: null,
        base64Image: customProduct.image, // Thêm dòng này
        price: customProduct.price,
        totalPrice: (customProduct.price * customProduct.quantity) + (shippingMethod === "Giao nhanh" ? 10000 : 0)
      };

      console.log("Sending order data:", orderData);
      const response = await axiosInstance.post("/customizeproducts/create-with-order", orderData);
      
      const data = response.data;
      console.log("Order API response:", data);

      const orderId = data.orderId || data.OrderId || data.id;
      if (!orderId) {
        throw new Error("Không nhận được mã đơn hàng");
      }

      setOrderStage(orderId);
        
      if (paymentMethod === "online") {
        await handleVNPayPayment(orderId);
      } else {
        dispatch(clearCart());
        setShowSuccessMessage(true);
        setOrderStatus("success");
        
        setTimeout(() => {
          navigate(`/order-detail/${orderId}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setOrderStatus("error");
      toast.error("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm hàm xử lý hiển thị modal xác nhận, validation
  const handleShowConfirm = () => {
    if (!recipientName || !deliveryAddress || !shippingMethod || !notes) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;  
    }
    

    if (cartItems.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }
    const phoneRegex = /^[0-9]{10,11}$/; // Chấp nhận số điện thoại 10-11 chữ số

  if (!notes || notes.trim() === "") {
    alert("Vui lòng nhập số điện thoại!");
    return;
  }

  if (!phoneRegex.test(notes)) {
    alert("Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.");
    return;
  }
    // setShowConfirmModal(true); // Mở modal nếu hợp lệ

    setShowConfirmModal(true);
  };

  // Component modal xác nhận đơn hàng
  const ConfirmOrderModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h3 className="text-2xl font-bold mb-4">Xác nhận đơn hàng</h3>
          
          {/* <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Thông tin giao hàng:</h4>
              <p>Người nhận: {recipientName}</p>
              <p>Địa chỉ: {deliveryAddress}</p>
              <p>Phương thức giao hàng: {shippingMethod}</p>
              <p>Số điện thoại: {notes}</p>
            </div> */}

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Thông tin giao hàng:</h4>
                <p>Người nhận: {recipientName || "Chưa nhập tên người nhận"}</p>
                <p>Địa chỉ: {deliveryAddress || "Chưa nhập địa chỉ"}</p>
                <p>Phương thức giao hàng: {shippingMethod || "Chưa chọn phương thức giao hàng"}</p>
                <p>Số điện thoại: {notes || "Chưa nhập số điện thoại"}</p>
            </div>


            <div>
              <h4 className="font-semibold">Chi tiết đơn hàng:</h4>
              {cartItems.map((item) => (
                <div key={item.productId} className="space-y-2 py-2">
                  <div className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} VND</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Màu áo: {item.shirtColor || "Chưa chọn màu"}</p>
                    {item.customDescription && (
                      <p>Mô tả: {item.customDescription}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Phí ship:</span>
                <span>{shippingFee.toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between font-bold mt-2">
                <span>Tổng cộng:</span>
                <span>{totalPrice.toLocaleString()} VND</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                setShowConfirmModal(false);
                handleCheckout();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Xác nhận đặt hàng
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Component hiển thị trạng thái đơn hàng
  const OrderStatusDisplay = () => {
    if (!showStatus) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          {orderStatus === "processing" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Đang xử lý đơn hàng...</p>
              <p className="text-gray-600 mt-2">Vui lòng chờ trong giây lát</p>
            </div>
          )}

          {orderStatus === "success" && (
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h3>
              <p className="text-gray-600 mb-6">Cảm ơn bạn đã tin tưởng và ủng hộ chúng tôi</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-gray-800">{orderStage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="font-semibold text-green-600">Chờ xử lý</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* <button
                  onClick={() => {
                    setShowStatus(false);
                    navigate("/member", { 
                      state: { 
                        orderId: orderStage,
                        orderDetails: {
                          recipientName,
                          deliveryAddress,
                          shippingMethod,
                          totalPrice,
                          orderDate: new Date().toLocaleString(),
                          status: "Chờ xử lý",
                          paymentMethod: paymentMethod,
                          paymentStatus: "Chưa thanh toán"
                        }
                      }
                    });
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiết đơn hàng
                </button> */}
                <button
                  onClick={() => {
                    setShowStatus(false);
                    navigate("/");
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
                <button
                  onClick={async () => {
                    setOrderStatus("checking_payment");
                    try {
                      const res = await fetch(`https://thisaonao-001-site1.rtempurl.com/Payment/SePay/payment-status?orderId=${orderStage}`);
                      if (!res.ok) throw new Error("Không thể kiểm tra trạng thái thanh toán");
                      const data = await res.json();
                      if (data.status === "success" || data.status === "paid") {
                        alert("Thanh toán thành công!");
                      } else if (data.status === "pending") {
                        alert("Thanh toán đang chờ xử lý.");
                      } else {
                        alert("Thanh toán thất bại hoặc chưa thanh toán.");
                      }
                    } catch (e) {
                      alert("Lỗi khi kiểm tra thanh toán: " + e.message);
                    } finally {
                      setOrderStatus("success");
                    }
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mt-2 "
                >
                  Kiểm tra thanh toán
                </button>
              </div>
            </div>
          )}

          {orderStatus === "error" && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thất bại</h3>
              <p className="text-gray-600 mb-6">Vui lòng thử lại sau</p>
              <button
                onClick={() => setShowStatus(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component hiển thị thông báo thành công
  const SuccessMessage = () => {
    if (!showSuccessMessage) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-500 ease-in-out">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h3>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã tin tưởng và ủng hộ chúng tôi</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-gray-800">{orderStage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-semibold text-green-600">Chờ xử lý</span>
              </div>
            </div>

            <div className="animate-pulse text-blue-600 mb-6">
              Đang chuyển hướng đến trang chi tiết đơn hàng...
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <ToastContainer />
      <SuccessMessage />
      {qrInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 text-center">
            <h3 className="text-xl font-bold mb-4">Quét mã QR để thanh toán</h3>
            <img src={qrInfo.qrImageUrl} alt="QR Thanh toán" className="mx-auto mb-4" />
            {/* <div className="mb-2">Nội dung: <b>{qrInfo.content}</b></div>
            <div className="mb-2">Số tài khoản: <b>{qrInfo.account}</b></div> */}
            <div className="mb-2">Số tiền: <b>{qrInfo.amount?.toLocaleString()} VND</b></div>
            <button
              onClick={() => setQrInfo(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              Đóng
            </button>
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  const res = await fetch(`https://thisaonao-001-site1.rtempurl.com/Payment/SePay/payment-status?orderId=${orderStage}`);
                  if (!res.ok) throw new Error("Không thể kiểm tra trạng thái thanh toán");
                  const data = await res.json();
                  if (data.status === "success" || data.status === "paid") {
                    alert("Thanh toán thành công!");
                  } else if (data.status === "pending") {
                    alert("Thanh toán đang chờ xử lý.");
                  } else {
                    alert("Thanh toán thất bại hoặc chưa thanh toán.");
                  }
                } catch (e) {
                  alert("Lỗi khi kiểm tra thanh toán: " + e.message);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
            </button>
          </div>
        </div>
      )}
      <OrderStatusDisplay />
      <ConfirmOrderModal />
      <h2 className="text-3xl font-bold mb-6 text-center">🛒 Giỏ hàng của bạn</h2>
      <div className="flex justify-center mb-6">
        <button
          onClick={() => navigate('/member')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Kiểm tra trạng thái đơn hàng
        </button>
      </div>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4 text-lg">Giỏ hàng của bạn đang trống.</p>
          <button onClick={() => navigate("/")} className="bg-blue-600 text-white py-2 px-6 rounded-lg">
            🛍 Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <ul>
              {cartItems.map((item) => (
                <li key={item.productId} className="flex justify-between items-center py-4 border-b">
                  <div className="flex items-center gap-4">
                    {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />}
                    <div>
                      <p className="text-lg font-semibold">{item.productName}</p>
                      {/* <div className="text-sm text-gray-600 mt-1">
                        <p><span className="font-medium">Màu áo:</span> {item.shirtColor || "Chưa chọn màu"}</p>
                        {item.isCustomProduct && item.customDescription && (
                          <p><span className="font-medium">Mô tả:</span> {item.customDescription}</p>
                        )}
                      </div> */}
                      <p className="text-gray-600 mt-1">{(item.price * item.quantity).toLocaleString()} VND</p>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, quantities[item.productId] - 1)}
                          className="bg-gray-300 px-2 py-1 rounded"
                        // Không cho giảm dưới 10
                        >
                          ➖
                        </button>
                        <input
                          type="number"
                          value={quantities[item.productId]}
                          onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                          className="w-12 text-center mx-2 border rounded"
                         
                        />
                        <button
                          onClick={() => handleQuantityChange(item.productId, quantities[item.productId] + 1)}
                          className="bg-gray-300 px-2 py-1 rounded"
                        >
                          ➕
                        </button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveItem(String(item.productId))}>
                    <Trash size={20} className="text-red-500 cursor-pointer" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-right">
              <p className="text-xl font-bold">Tổng cộng: {totalPrice.toLocaleString()} VND</p>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Thông tin giao hàng</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên người nhận"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Địa chỉ giao hàng"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            {/* <select
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value)}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Giao thường">Giao thường</option>
              <option value="Giao nhanh">Giao nhanh (+10,000 VND)</option>
            </select> */}
            <input
              placeholder="Số điện thoại"
              value={notes}
              onChange={(e) => {
                const input = e.target.value;
                if (/^\d*$/.test(input)) {
                  setNotes(input);
                }
              }}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Thanh toán online</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">Phí ship:</p>
              <p className="font-semibold">{shippingFee.toLocaleString()} VND</p>
            </div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-xl font-bold">Tổng cộng:</p>
              <p className="text-2xl font-bold text-blue-600">{totalPrice.toLocaleString()} VND</p>
            </div>
            <button
              onClick={handleShowConfirm}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isLoading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Đặt Hàng"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;