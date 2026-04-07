// admin/src/context/AdminContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AdminContext = createContext({
  token: "",
  setToken: () => {},
  role: "",
  setRole: () => {}
});

const AdminContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [role]);

  return (
    <AdminContext.Provider value={{ token, setToken, role, setRole }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
