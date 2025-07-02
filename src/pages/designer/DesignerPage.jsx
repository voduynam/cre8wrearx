import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Text, Image } from 'react-konva';
import useImage from 'use-image';
import { useDispatch } from "react-redux";
import { addToCart as addToCartAction } from "../../redux/slices/cartSlice";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DesignerPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState(null);
  const [productBaseImage] = useImage(productImageUrl, 'anonymous');
  const [text, setText] = useState('Your Text');
  const [textColor, setTextColor] = useState('#000000');
  const [decoration, setDecoration] = useState(null); // { src, x, y, width, height }
  const stageRef = useRef();
  const [textProps, setTextProps] = useState({ x: 100, y: 200 });
  const dispatch = useDispatch();
  const [recipientName, setRecipientName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("Tiêu chuẩn");
  const [shippingFee, setShippingFee] = useState(20000);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [description, setDescription] = useState("");

  const allowedArea = { x: 80, y: 80, width: 150, height: 320 };

  // Fetch products from API
  useEffect(() => {
    fetch('https://localhost:7163/api/Product')
      .then(res => res.json())
      .then(data => setProducts(data.data.$values || []));
  }, []);

  // When product is selected, set image URL
  useEffect(() => {
    if (!selectedProductId) return;
    const selectedProduct = products.find(p => p.productId === Number(selectedProductId));
    if (selectedProduct?.image) {
      // Use Cloudinary link directly if present
      setProductImageUrl(selectedProduct.image);
    }
  }, [selectedProductId, products]);

  // Tính ngày giao hàng tự động (hiện tại + 3 ngày)
  useEffect(() => {
    const now = new Date();
    now.setDate(now.getDate() + 3);
    setDeliveryDate(now.toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
  }, []);

  // Cập nhật phí ship theo phương thứcs
  useEffect(() => {
    if (shippingMethod === "Tiêu chuẩn") setShippingFee(20000);
    else if (shippingMethod === "Nhanh") setShippingFee(30000);
    else if (shippingMethod === "Hỏa tốc") setShippingFee(50000);
  }, [shippingMethod]);

  // Handle decoration image upload
  const handleDecorationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image under 5MB!');
      return;
    }
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = new window.Image();
    img.onload = () => {
      setDecoration({
        src: base64,
        x: 120,
        y: 120,
        width: 60,
        height: 60
      });
    };
    img.src = base64;
  };

  // Handle drag decoration
  const handleDecorationDragEnd = (e) => {
    setDecoration(prev => prev ? { ...prev, x: e.target.x(), y: e.target.y() } : null);
  };

  // Remove decoration
  const removeDecoration = () => setDecoration(null);

  // Submit design
  const handleOrder = async () => {
    if (!selectedProductId) return alert('Chọn sản phẩm!');
    if (!recipientName || !deliveryAddress) return alert('Vui lòng nhập đầy đủ thông tin người nhận!');
    const dataUrl = stageRef.current.toDataURL({
      mimeType: "image/jpeg",
      quality: 0.95
    });

    const payload = {
      productId: selectedProductId,
      userId: 2,
      shirtColor: "Red",
      fullImage: null,
      base64Image: dataUrl,
      designMetadata: JSON.stringify({
        canvasWidth: 400,
        canvasHeight: 500,
        elements: [
          { type: "text", value: text }
        ]
      }),
      description,
      recipientName,
      deliveryAddress,
      shippingMethod,
      shippingFee,
      notes,
      quantity,
      deliveryDate
    };

    console.log('Payload gửi API:', payload);

    await fetch('https://localhost:7163/api/customizeproducts/create-with-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    alert('Đã gửi đơn hàng!');
  };

  const handleTextDragEnd = (e) => {
    let x = e.target.x();
    let y = e.target.y();
    x = Math.max(allowedArea.x, Math.min(x, allowedArea.x + allowedArea.width));
    y = Math.max(allowedArea.y, Math.min(y, allowedArea.y + allowedArea.height));
    setTextProps({ x, y });
  };

  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm!');
      return;
    }
    const selectedProduct = products.find(p => p.productId === Number(selectedProductId));
    if (!selectedProduct) {
      toast.error('Không tìm thấy sản phẩm!');
      return;
    }
    dispatch(addToCartAction(selectedProduct));
    toast.success('Đã thêm sản phẩm vào giỏ hàng!', {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <ToastContainer />
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold mb-2">Chọn sản phẩm</h3>
        <select className="mb-4 p-2 border rounded" onChange={e => setSelectedProductId(Number(e.target.value))} value={selectedProductId}>
          <option value="">Chọn sản phẩm</option>
          {products.map(p => (
            <option key={p.productId} value={p.productId}>{p.productName}</option>
          ))}
        </select>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex justify-center items-center p-4">
            <Stage width={400} height={500} ref={stageRef}>
              <Layer>
                {productBaseImage && (
                  <Image image={productBaseImage} width={400} height={500} />
                )}
                {decoration && (
                  <Image
                    image={(() => {
                      const img = new window.Image();
                      img.src = decoration.src;
                      return img;
                    })()}
                    x={decoration.x}
                    y={decoration.y}
                    width={decoration.width}
                    height={decoration.height}
                    draggable
                    onDragEnd={handleDecorationDragEnd}
                    dragBoundFunc={pos => {
                      const minX = allowedArea.x;
                      const maxX = allowedArea.x + allowedArea.width;
                      const minY = allowedArea.y;
                      const maxY = allowedArea.y + allowedArea.height;
                      return {
                        x: Math.max(minX, Math.min(pos.x, maxX)),
                        y: Math.max(minY, Math.min(pos.y, maxY))
                      };
                    }}
                  />
                )}
                <Text
                  text={text}
                  fontSize={20}
                  fill={textColor}
                  x={textProps.x}
                  y={textProps.y}
                  draggable
                  onDragEnd={e => setTextProps({ x: e.target.x(), y: e.target.y() })}
                  dragBoundFunc={pos => {
                    // Clamp x, y vào vùng allowedArea
                    const minX = allowedArea.x;
                    const maxX = allowedArea.x + allowedArea.width;
                    const minY = allowedArea.y;
                    const maxY = allowedArea.y + allowedArea.height;
                    return {
                      x: Math.max(minX, Math.min(pos.x, maxX)),
                      y: Math.max(minY, Math.min(pos.y, maxY))
                    };
                  }}
                />
              </Layer>
            </Stage>
          </div>
          <div className="space-y-6 w-full">
            <div>
              <h3 className="font-semibold mb-2">Thêm chữ</h3>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Nhập chữ lên áo"
              />
              <div className="mt-2">
                <label className="block mb-2">Màu chữ:</label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Thêm hình dán</h3>
              {!decoration ? (
                <input type="file" accept="image/*" onChange={handleDecorationUpload} className="w-full p-2 border rounded" />
              ) : (
                <div className="flex space-x-2 items-center">
                  <button onClick={removeDecoration} className="px-4 bg-red-500 text-white rounded hover:bg-red-600">Xóa hình</button>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">Chỉ hỗ trợ PNG, JPG, GIF (dưới 5MB)</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold mb-2">Thông tin người nhận</h3>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Tên người nhận"
              />
              <input
                type="text"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Địa chỉ giao hàng"
              />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Số điện thoại người nhận"
                rows={2}
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Nhập số lượng size và mô tả tùy ý"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold mb-2">Số lượng:</h3>
              <button
                type="button"
                className="px-3 py-1 bg-gray-200 rounded text-lg"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >-</button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-16 p-2 border rounded text-center"
              />
              <button
                type="button"
                className="px-3 py-1 bg-gray-200 rounded text-lg"
                onClick={() => setQuantity(q => q + 1)}
              >+</button>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Phương thức vận chuyển</h3>
              <select
                className="w-full p-2 border rounded mb-2"
                value={shippingMethod}
                onChange={e => setShippingMethod(e.target.value)}
              >
                <option value="Tiêu chuẩn">Tiêu chuẩn (20,000đ)</option>
                <option value="Nhanh">Nhanh (30,000đ)</option>
                <option value="Hỏa tốc">Hỏa tốc (50,000đ)</option>
              </select>
              <div className="text-gray-700 mb-2">Phí vận chuyển: <b>{shippingFee.toLocaleString()}đ</b></div>
            </div>
            {/* <div>
              <h3 className="font-semibold mb-2">Ngày giao dự kiến</h3>
              <input
                type="datetime-local"
                value={deliveryDate}
                readOnly
                className="w-full p-2 border rounded bg-gray-100 text-gray-700"
              />
            </div> */}
            {/* <button
              onClick={handleAddToCart}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition"
            >
              Thêm vào giỏ hàng
            </button> */}
            <button
              onClick={handleOrder}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerPage;



