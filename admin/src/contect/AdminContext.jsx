// admin/src/context/AdminContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AdminContext = createContext({
  token: "",
  setToken: () => {}
});

const AdminContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    } catch (e) {}
  }, [token]);

  return (
    <AdminContext.Provider value={{ token, setToken }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
