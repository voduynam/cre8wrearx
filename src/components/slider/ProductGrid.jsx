import banner1 from "../../assets copy/slider/banner/Artboard 1 copy 3.png";
import banner2 from "../../assets copy/slider/banner/Artboard 1 copy 2.png";
import banner3 from "../../assets copy/slider/banner/Artboard 1 copy.png";
import banner4 from "../../assets copy/slider/banner/Artboard 2.png";

const images = [
  {
    src: banner1,
    colSpan: "col-span-4 md:col-span-4",
    rowSpan: "row-span-1 md:row-span-1",
  },
  {
    src: banner4,
    colSpan: "col-span-1 md:col-span-1",
    rowSpan: "row-span-2 md:row-span-2",
  },
  {
    src: banner2,
    colSpan: "col-span-2 md:col-span-2",
    rowSpan: "row-span-1 md:row-span-1",
  },
  {
    src: banner3,
    colSpan: "col-span-2 md:col-span-2",
    rowSpan: "row-span-1 md:row-span-1",
  },
];

const ProductGrid = () => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-5 gap-4 w-full'>
      {images.map((img, index) => (
        <div key={index} className={`relative ${img.colSpan} ${img.rowSpan}`}>
          <img
            src={img.src}
            alt={`item-${index}`}
            className='w-full h-full shadow-lg object-cover'
          />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
