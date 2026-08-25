import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { initLenis } from "@/lib/lenis";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Admin from "@/pages/Admin";

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  useEffect(() => {
    initLenis();
  }, []);

  return (
    <div className="App grain">
      <BrowserRouter>
        <ScrollReset />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        toastOptions={{
          style: { background: "#0E0E0E", border: "1px solid rgba(212,175,55,0.3)", color: "#F8F8F6" },
        }}
      />
    </div>
  );
}

export default App;
