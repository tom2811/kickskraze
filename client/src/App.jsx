import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from './contexts/CartContext';
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Store from "./pages/Store";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Theme>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/store" element={<Store />} />
                </Routes>
              </main>
              {!isLoading && <Footer />}
            </div>
          </Theme>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
