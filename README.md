# 🥂 Saloon Booking Management System (Rose & Champagne Edition)

A high-fidelity, full-stack **MERN** application designed for premium salon management and local geospatial discovery. This platform features a sophisticated "Rose & Champagne" light aesthetic and real-time mapping capabilities.

---

## 🌟 Key Performance Features

### 📍 Local Discovery & Geospatial Precision
- **Real-time Proximity Engine**: Automatically calculates and displays distances (e.g., `📍 1.5 km away`) from the user's current location using a precision Haversine formula.
- **Embedded Discovery Feed**: Integrated Google Maps preview on the customer homepage for effortless workspace discovery.
- **Precision Mapping**: Linked high-precision GPS coordinates for every salon seat in the registry.

### 🏢 Elite Owner Dashboard
- **Signature Workspace Profiling**: One-click coordinate detection to link physical addresses to global navigation.
- **Service Architecture**: Inline management of elite treatment menus, allowing owners to update services, pricing, and durations instantly.
- **Team Management**: Robust controls for assigning/removing professional talent and managing artist visibility.
- **Operational Toggles**: Immediate "Public Visibility" switch to control salon presence in the global discovery feed.

### 🎨 Premium Aesthetics
- **Rose & Champagne Design System**: A high-end, light-theme visual language featuring glassmorphism, fluid animations (Framer Motion), and modern typography.
- **Rich Interactive UI**: Smooth transitions, hover states, and micro-animations for an elevated user experience.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose) |
| **State & Auth** | Context API, JWT authentication, Axios |
| **Cloud** | Cloudinary (Images), Google Maps API (Geolocation) |

---

## 🚀 Getting Started

### 1. Prerequisite Installation
Ensure you have **Node.js** and **npm** installed on your system.

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory with the following variables:
```env
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_url
```
And in the `frontend/` directory (if using Google Maps):
```env
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

### 3. Installation & Deployment

**Backend Setup:**
```bash
cd backend
npm install
npm run server
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

**Admin Dashboard Setup:**
```bash
cd admin
npm install
npm run dev
```

---

## 🔗 Repository Reference

- **Live Repository**: [anikettP/saloon-booking-managment](https://github.com/anikettP/saloon-booking-managment)

---
*Developed with precision for a seamless grooming booking experience.* 💅✨
