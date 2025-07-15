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
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [textFontSize, setTextFontSize] = useState(20);
  const [decorationSize, setDecorationSize] = useState(60);
  const [phone, setPhone] = useState("");

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 900;
  const allowedArea = { x: 260, y: 180, width: 530, height: 630 };

  // Khi đã load được productBaseImage, lấy kích thước gốc
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  useEffect(() => {
    if (productBaseImage) {
      setImgNaturalSize({
        width: productBaseImage.width,
        height: productBaseImage.height
      });
    }
  }, [productBaseImage]);

  // Tính toán scale để ảnh vừa với canvas mà không bị bóp méo
  const scale = Math.min(
    CANVAS_WIDTH / imgNaturalSize.width,
    CANVAS_HEIGHT / imgNaturalSize.height
  );
  const displayWidth = imgNaturalSize.width * scale;
  const displayHeight = imgNaturalSize.height * scale;

  // Fetch products from API
  useEffect(() => {
    fetch('https://thisaonao-001-site1.rtempurl.com/api/Product')
    
      .then(res => res.json())
      .then(data => {
        // Đúng key là Data.$values
        const products = (data.Data?.$values || [])
          .filter(p => !p.IsDeleted)
          .map(p => ({
            ...p,
            categoryId: p.CategoryId,
            productId: p.ProductId,
            productName: p.ProductName,
            image: p.Image, // Thêm dòng này!
          }));
        setProducts(products);
        console.log("product", products);
      });
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch('https://thisaonao-001-site1.rtempurl.com/api/Category')
      .then(res => res.json())
      .then(data => {
        if (data.Status === 1 && data.Data && data.Data.$values) {
          setCategories(data.Data.$values.map(cat => ({
            categoryId: cat.CategoryId,
            categoryName: cat.CategoryName,
            ...cat
          })));
        }
      });
  }, []);

  // Filter products by selected category
  const filteredProducts = selectedCategoryId
    ? products.filter(p => String(p.categoryId) === String(selectedCategoryId))
    : products;

  // When product is selected, set image URL
  useEffect(() => {
    if (!selectedProductId) return;
    const selectedProduct = products.find(p => p.productId === Number(selectedProductId));
    console.log("selectedProductId:", selectedProductId);
    console.log("selectedProduct:", selectedProduct);
    console.log("selectedProduct.image:", selectedProduct?.image);
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
        width: decorationSize,
        height: decorationSize
      });
    };
    img.src = base64;
  };

  // Handle drag decoration
  // const handleDecorationDragEnd = (e) => {
  //   if (!decoration) return;
  //   const { x, y } = clampImagePosition(e.target.x(), e.target.y(), decoration.width, decoration.height);
  //   setDecoration(prev => prev ? { ...prev, x, y } : null);
  // };

  // Remove decoration
  const removeDecoration = () => setDecoration(null);

  // When decorationSize changes, update decoration size
  useEffect(() => {
    if (decoration) {
      setDecoration(prev => {
        if (!prev) return null;
        const { x, y } = clampImagePosition(prev.x, prev.y, decorationSize, decorationSize);
        return { ...prev, width: decorationSize, height: decorationSize, x, y };
      });
    }
    // eslint-disable-next-line
  }, [decorationSize]);

  // Submit design
  const handleOrder = async () => {
    if (!selectedProductId) return alert('Vui lòng chọn sản phẩm!');
    if (!recipientName.trim()) return alert('Vui lòng nhập tên người nhận!');
    if (!deliveryAddress.trim()) return alert('Vui lòng nhập địa chỉ giao hàng!');
    if (!notes.trim()) return alert('Vui lòng nhập số điện thoại!');
    if (!/^(0[0-9]{8,11})$/.test(notes.trim())) return alert('Số điện thoại không hợp lệ!');
    if (!quantity || quantity < 1) return alert('Số lượng phải lớn hơn 0!');

    const dataUrl = stageRef.current.toDataURL({
      mimeType: "image/jpeg",
      quality: 0.95
    });

    const payload = {
      productId: selectedProductId,
      ShirtColor: "red",
      userId: 2,
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
      phone,
      shippingMethod,
      shippingFee,
      notes,
      quantity,
      deliveryDate
    };

    console.log('Payload gửi API:', payload);

    const res = await fetch('https://thisaonao-001-site1.rtempurl.com/api/customizeproducts/create-with-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Order API response:', data);
    alert('Đã gửi đơn hàng!');
  };

  // Khi đổi cỡ chữ, clamp lại vị trí text
  useEffect(() => {
    setTextProps(prev => {
      const { x, y } = clampTextPosition(prev.x, prev.y, textFontSize, text);
      return { x, y };
    });
    // eslint-disable-next-line
  }, [textFontSize, text]);
  // Khi đổi cỡ hình dán, clamp lại vị trí image
  useEffect(() => {
    if (decoration) {
      setDecoration(prev => {
        if (!prev) return null;
        const { x, y } = clampImagePosition(prev.x, prev.y, decorationSize, decorationSize);
        return { ...prev, width: decorationSize, height: decorationSize, x, y };
      });
    }
    // eslint-disable-next-line
  }, [decorationSize]);

  // Clamp position for text so it stays inside allowedArea
  const clampTextPosition = (x, y, fontSize, textValue) => {
    // Ước lượng width/height text
    const textWidth = textValue.length * fontSize * 0.6;
    const textHeight = fontSize;
    const minX = allowedArea.x;
    const maxX = allowedArea.x + allowedArea.width - textWidth;
    const minY = allowedArea.y;
    const maxY = allowedArea.y + allowedArea.height - textHeight;
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY))
    };
  };
  // Clamp position for image so it stays inside allowedArea
  const clampImagePosition = (x, y, width, height) => {
    const minX = allowedArea.x;
    const maxX = allowedArea.x + allowedArea.width - width;
    const minY = allowedArea.y;
    const maxY = allowedArea.y + allowedArea.height - height;
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY))
    };
  };

  // Khi kéo text
  const handleTextDragEnd = (e) => {
    const { x, y } = clampTextPosition(e.target.x(), e.target.y(), textFontSize, text);
    setTextProps({ x, y });
  };
  // Khi kéo hình dán
  const handleDecorationDragEnd = (e) => {
    if (!decoration) return;
    const { x, y } = clampImagePosition(e.target.x(), e.target.y(), decoration.width, decoration.height);
    setDecoration(prev => prev ? { ...prev, x, y } : null);
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

  const handleAddCurrentDesignToCart = () => {
    const dataUrl = stageRef.current.toDataURL({ mimeType: "image/jpeg", quality: 0.95 });
    const selectedProduct = products.find(p => p.productId === Number(selectedProductId));
    dispatch(addToCartAction({
      // Các trường cơ bản cho custom product:
      // CustomizeProductId: null, // Nếu có
      productId: selectedProductId,
      productName: selectedProduct?.productName || 'Thiết kế của bạn',
      price: selectedProduct?.price || 0, // hoặc giá custom
      image: dataUrl, // Ảnh thiết kế
      isCustomProduct: true,
      customDescription: description,
      // Thêm các trường khác nếu cần: text, textColor, textFontSize, decoration, ...
    }));
    toast.success('Đã thêm thiết kế vào giỏ hàng!', { autoClose: 1500 });
  };

  return (
    <div className="flex flex-row max-w-7xl mx-auto min-h-screen py-8 gap-10 bg-gray-50">
      {/* Cột trái: Canvas sản phẩm */}
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-2xl p-6 flex justify-center items-center">
          <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={stageRef} className="block mx-auto">
            <Layer>
              {productBaseImage && (
                <Image
                  image={productBaseImage}
                  width={900}
                  height={900}
                  x={0}
                  y={0}
                />
              )}
              {/* Vùng allowedArea (có thể vẽ khung nếu muốn) */}
              {/* <Rect
                x={allowedArea.x}
                y={allowedArea.y}
                width={allowedArea.width}
                height={allowedArea.height}
                stroke="#aaa"
                dash={[6, 4]}
              /> */}
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
                  dragBoundFunc={pos => clampImagePosition(pos.x, pos.y, decoration.width, decoration.height)}
                />
              )}
              <Text
                text={text}
                fontSize={textFontSize}
                fill={textColor}
                x={textProps.x}
                y={textProps.y}
                draggable
                onDragEnd={handleTextDragEnd}
                dragBoundFunc={pos => clampTextPosition(pos.x, pos.y, textFontSize, text)}
              />
            </Layer>
          </Stage>
        </div>
      </div>
      {/* Cột phải: Form điều khiển */}
      <div className="w-[370px] flex-shrink-0">
        <ToastContainer />
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="font-semibold mb-2">Chọn danh mục</h3>
          <select
            className="mb-4 p-2 border rounded w-full"
            onChange={e => setSelectedCategoryId(e.target.value)}
            value={selectedCategoryId}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
            ))}
          </select>
          <h3 className="font-semibold mb-2">Chọn sản phẩm</h3>
          <select className="mb-4 p-2 border rounded w-full" onChange={e => setSelectedProductId(Number(e.target.value))} value={selectedProductId}>
            <option value="">Chọn sản phẩm</option>
            {filteredProducts.map(p => (
              <option key={p.productId} value={p.productId}>{p.productName}</option>
            ))}
          </select>

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
              <div className="mt-2 flex items-center gap-4">
                <label className="block">Màu chữ:
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="ml-2" />
                </label>
                <label className="block">Cỡ chữ:
                  <input
                    type="number"
                    min={8}
                    max={100}
                    value={textFontSize}
                    onChange={e => setTextFontSize(Number(e.target.value))}
                    className="ml-2 w-16 p-1 border rounded"
                  />
                </label>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Thêm hình dán</h3>
              {!decoration ? (
                <input type="file" accept="image/*" onChange={handleDecorationUpload} className="w-full p-2 border rounded" />
              ) : (
                <div className="flex space-x-2 items-center">
                  <button onClick={removeDecoration} className="px-4 bg-red-500 text-white rounded hover:bg-red-600">Xóa hình</button>
                  <label className="block">Cỡ hình:
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={decorationSize}
                      onChange={e => setDecorationSize(Number(e.target.value))}
                      className="ml-2 w-16 p-1 border rounded"
                    />
                  </label>
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
              <input
                type="number"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Số điện thoại người nhận"
                maxLength={10}
                minLength={10}
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
            <button
              onClick={handleAddCurrentDesignToCart}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition mb-2"
            >
              Thêm vào giỏ hàng
            </button>
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



