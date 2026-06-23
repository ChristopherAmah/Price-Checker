import { useState, useEffect, useRef } from "react";

const PriceChecker = () => {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  const inputRef = useRef(null);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset after 5 seconds
  useEffect(() => {
    let timer;
    if (showResult) {
      timer = setTimeout(() => {
        setShowResult(false);
        setProduct(null);
        setBarcode("");
        setError("");
        inputRef.current?.focus();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showResult]);

  const fetchProduct = async () => {
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) return;

    setLoading(true);
    setError("");
    setProduct(null);

    try {
      const response = await fetch("/api/check-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barcode: trimmedBarcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Server error");
      }

      if (data?.success && data?.name) {
        setProduct({
          id: data.product_id,
          name: data.name,
          barcode: data.barcode,
          reference: data.internal_reference,
          price: data.price,
          symbol: data.currency_symbol || "₦",
          currencyPosition: data.currency_position || "before",
          uom: data.uom || "Units",
          stock: data.stock_status || "Unknown",
          imageUrl: data.image_url,
        });
        setShowResult(true);
      } else {
        setError(data?.message || "Product not found. Please check the barcode.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to reach the price server.");
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = product
    ? Number(product.price || 0).toLocaleString()
    : "";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-10 text-center border border-gray-200">
        <h1 className="text-sm font-bold tracking-widest text-gray-400 mb-6 uppercase">
          Laterna ERP Price Checker
        </h1>

        {!showResult ? (
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              autoFocus
              placeholder="Scan or enter barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProduct()}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-orange-500 transition-all"
            />

            <button
              onClick={fetchProduct}
              disabled={loading || !barcode.trim()}
              className={`w-full py-3 rounded-full font-bold text-white transition-all ${
                loading
                  ? "bg-gray-400"
                  : "bg-orange-600 hover:bg-orange-700 shadow-md"
              }`}
            >
              {loading ? "SEARCHING..." : "CHECK PRICE"}
            </button>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </div>
        ) : (
          <div className="py-6 animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-semibold text-gray-800 leading-tight">
              {product?.name}
            </h2>

            <p className="text-5xl font-black text-green-600 my-6">
              {product?.currencyPosition === "after" ? (
                <>
                  {formattedPrice} {product?.symbol}
                </>
              ) : (
                <>
                  {product?.symbol}
                  {formattedPrice}
                </>
              )}
            </p>

            <div className="inline-block px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase mb-6">
              {product?.stock}
            </div>

            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full animate-progress-shrink"></div>
            </div>

            <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-tighter">
              Next scan available in 5 seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChecker;
