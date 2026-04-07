import React, { useContext } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext";

// Dashboard
import Dashboard from "./pages/Dashboard";
// Salon Management
import SalonApprovals from "./pages/SalonApprovals";
// Service Management (replaces Add/List Products)
import AddService from "./pages/AddService";
import ListServices from "./pages/ListServices";
// Booking Management (replaces Orders)
import BookingManagement from "./pages/BookingManagement";
// Content Management
import Banners from "./pages/Banners";
import Banner2 from "./pages/Banner2";
import ManualReviews from "./pages/ManualReviews";
// User Management
import UserManagement from "./pages/UserManagement";
import ArtistDirectory from "./pages/ArtistDirectory";
import AdminManageSalon from "./pages/AdminManageSalon";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const { token, setToken } = useContext(AdminContext);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      {token === "" ? (
        <Login />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="flex-1 mx-auto ml-[max(3vw,16px)] my-6 text-gray-600 text-base overflow-auto">
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard token={token} />} />
                <Route path="/dashboard" element={<Dashboard token={token} />} />

                {/* Salon Management */}
                <Route path="/salon-approvals" element={<SalonApprovals token={token} />} />

                {/* Service Management */}
                <Route path="/add-service" element={<AddService token={token} />} />
                <Route path="/services" element={<ListServices token={token} />} />

                {/* Legacy product routes → redirect to services */}
                <Route path="/add" element={<AddService token={token} />} />
                <Route path="/list" element={<ListServices token={token} />} />

                {/* Booking Management */}
                <Route path="/bookings" element={<BookingManagement token={token} />} />
                <Route path="/orders" element={<BookingManagement token={token} />} />

                {/* Content Management */}
                <Route path="/banners" element={<Banners token={token} />} />
                <Route path="/banner2" element={<Banner2 token={token} />} />
                <Route path="/testimonials" element={<ManualReviews token={token} />} />

                {/* User Management */}
                <Route path="/users" element={<UserManagement token={token} />} />
                <Route path="/artists" element={<ArtistDirectory token={token} />} />
                
                {/* Global Manage */}
                <Route path="/manage-salon/:id" element={<AdminManageSalon token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;