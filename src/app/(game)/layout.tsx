import React from "react";
import Header from "@/components/landing/headers/Header";
import Footer from "@/components/landing/footer/Footer";
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-[#1b1b1b] min-h-screen">
      <Header />
      <div className=" ">
        <div className=" container">
          {/* <Nav /> */}
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
