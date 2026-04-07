// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./ScrollToTop.jsx";

import { PopupProvider } from './context/PopupContext';

// Pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery.jsx";

// Salon Pages
import Salons from "./pages/Salons.jsx";
import SalonDetail from "./pages/SalonDetail.jsx";
import BookingFlow from "./pages/BookingFlow.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import RegisterSalon from "./pages/RegisterSalon";
import Dashboard from "./pages/Dashboard.jsx";
import ArtistDashboard from "./pages/ArtistDashboard.jsx";
import SalonReviews from "./pages/SalonReviews.jsx";
import ManageSalon from "./pages/ManageSalon.jsx";
import MapBooking from "./pages/MapBooking.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

// Legacy pages still accessible
import Verify from "./pages/Verify.jsx";

// Components
import WhatsAppButton from './components/WhatsAppButton';

const App = () => {
  return (
    <div className="font-outfit">
      <PopupProvider>
        <ScrollToTop />
        <Navbar />

        <WhatsAppButton />

        <Routes>
          {/* ─── Public Routes ─── */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/verify" element={<Verify />} />

          {/* ─── Salon / Service Discovery ─── */}
          <Route path="/salons" element={<Salons />} />
          <Route path="/salon/:salonId" element={<SalonDetail />} />
          <Route path="/salon/register" element={<RegisterSalon />} />

          {/* Legacy collection routes → redirect to salons */}
          <Route path="/collection" element={<Salons />} />
          <Route path="/collection/latest" element={<Salons />} />
          <Route path="/collection/bestsellers" element={<Salons />} />
          <Route path="/map-booking" element={<MapBooking />} />

          {/* ─── Booking Flow ─── */}
          <Route path="/book" element={<BookingFlow />} />
          <Route path="/book/:salonId" element={<BookingFlow />} />

          {/* Legacy routes */}
          <Route path="/cart" element={<BookingFlow />} />
          <Route path="/place-order" element={<BookingFlow />} />

          {/* ─── User Account ─── */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/orders" element={<MyBookings />} />

          {/* ─── Dashboards ─── */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/artist-dashboard" element={<ArtistDashboard />} />
          <Route path="/salon/manage/:salonId" element={<ManageSalon />} />
          <Route path="/salon/reviews/:salonId" element={<SalonReviews />} />
        </Routes>

        <Footer />
      </PopupProvider>
    </div>
  );
};

export default App;