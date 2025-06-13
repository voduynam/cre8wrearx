import React from 'react';
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';

import Header from './components/Header';
import Footer from './components/Footer';
import NewProductCarousel from './components/NewProductCarousel';

import Home from './pages/home/Home';
import Cart from './pages/cart/Cart';
import ProductDetail from './pages/product/ProductDetail';
import DesignerPage from './pages/designer/DesignerPage';
import Checkout from './pages/checkout/Checkout';
import Register from './pages/register/Register';
import Login from './pages/login/Login';
import StaffPage from "./pages/staff/StaffPage";
import MemberPage from './pages/member/MemberPage';

import OrderDetail from './pages/oders/OrderDetail';
import OrderStatus from './pages/oders/OrderStatus';
import OrderTracking from './pages/oders/OrderTracking';

import ContactPage from './pages/contact/ContactPage';
import PricingTable from './pages/pricing/PricingTable';
import PricingClass from './pages/pricing/PricingClass';
import PricingAccessory from './pages/pricing/PricingAccessory';
import PricingService from './pages/pricing/PricingService';
import DesignSamples from './pages/designSamples/DesignSamples';
import CheckoutConfirmation from './pages/checkout/CheckoutConfirmation';
import InfoPage from './pages/info/InfoPage';
import ArticleDetail from './pages/articleDetail/ArticleDetail';
import NewsPage from './pages/news/NewsPage';
import NewsDetail from './pages/news/NewsDetail';
import HandPage from './pages/hand/HandPage';
import HandDetail from './pages/hand/HandDetail';
import ProfilePage from './pages/profile/ProfilePage';
import PaymentCallback from "./pages/payment/PaymentCallback";
import CheckPaymentSuccess from "./pages/checkout/CheckPaymentSucces";
import CheckPaymentFailed from "./pages/checkout/CheckPaymentFaild";


// Component bảo vệ route dựa trên role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, isAuthenticated } = useSelector((state) => state.user);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Chuyển đổi role string thành roleId tương ứng
  let roleId;
  switch(role) {
    case "admin":
      roleId = 1;
      break;
    case "staff":
      roleId = 2;
      break;
    case "member":
      roleId = 3;
      break;
    default:
      roleId = 0; // Không có quyền
  }
  
  if (!allowedRoles.includes(roleId)) {
    console.log(`Access denied: User role ${role} (${roleId}) not in allowed roles ${allowedRoles}`);
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const location = useLocation();  // Lấy đường dẫn hiện tại
  const hideHeaderFooter = false;

  return (
    <>
      {!hideHeaderFooter && <Header />}

      
      {/* Chỉ hiển thị Carousel khi ở trang chủ (/) */}
      {/* {location.pathname === '/' && <NewProductCarousel />} */}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/design/custom" element={<DesignerPage/>} />
          <Route path="/design/mau-co-san" element={<DesignSamples/>}/>
          <Route path="/design/bang-gia-dong-phuc" element={<PricingTable />} />
          <Route path="/design/bang-gia-ao-lop" element={<PricingClass />} />
          <Route path="/design/bang-gia-phu-kien" element={<PricingAccessory />} />
          <Route path="/design/bang-gia-dich-vu" element={<PricingService />} />
          <Route path="/blog" element={<InfoPage />} />
          <Route path="/blog/:id" element={<ArticleDetail />} />
          <Route path="/blog/class" element={<NewsPage />} />
          <Route path="/blog/class/:id" element={<NewsDetail />} />
          <Route path="/blog/b" element={<HandPage />} />
          <Route path="/blog/b/:id" element={<HandDetail />} />
          <Route path="/blog/b/:id" element={<HandDetail />} />
          <Route path="/payment-success" element={<CheckPaymentSuccess />} />
          <Route path="/payment-failed" element={<CheckPaymentFailed />} />
          {/* <Route path="/order-detail" element={<OrderDetail />} /> */}

          {/* Protected routes for Staff (roleId = 2) */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={[2]}><StaffPage /></ProtectedRoute>} />
          <Route path="/order-tracking/" element={<ProtectedRoute allowedRoles={[2]}><OrderTracking /></ProtectedRoute>} />
          <Route path="/order-detail/:orderId" element={<ProtectedRoute allowedRoles={[2]}><OrderDetail /></ProtectedRoute>} />
          {/* <Route path="/member" element={<ProtectedRoute allowedRoles={[2]}><MemberPage /></ProtectedRoute>} /> */}
           {/* <Route path="/order-tracking/:orderId" element={<ProtectedRoute allowedRoles={[2]}><OrderTracking /></ProtectedRoute>} /> */}

           <Route path="/member" element={<ProtectedRoute allowedRoles={[2, 3]}><MemberPage /></ProtectedRoute>} />

          {/* Protected routes for Member (roleId = 3) */}
          {/* <Route path="/member" element={<ProtectedRoute allowedRoles={[3]}><MemberPage /></ProtectedRoute>} /> */}
          <Route path="/cart" element={<ProtectedRoute allowedRoles={[3]}><Cart /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute allowedRoles={[3]}><ProductDetail /></ProtectedRoute>} />
          {/* <Route path="/design/custom" element={<ProtectedRoute allowedRoles={[3]}><DesignerPage /></ProtectedRoute>} />
          <Route path="/design/mau-co-san" element={<ProtectedRoute allowedRoles={[3]}><DesignSamples /></ProtectedRoute>} /> */}
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={[3]}><Checkout /></ProtectedRoute>} />
          <Route path="/checkout-confirmation" element={<ProtectedRoute allowedRoles={[3]}><CheckoutConfirmation /></ProtectedRoute>} />
          <Route path="/order-status" element={<ProtectedRoute allowedRoles={[3]}><OrderStatus /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={[3]}><ProfilePage /></ProtectedRoute>} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
};

const App = () => (
  <Provider store={store}>
    <Router>
      <AppContent />
    </Router>
  </Provider>
);

export default App;


