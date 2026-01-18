import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// 1. Import the hook
import { usePopup } from "../context/PopupContext";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  
  // 2. Get the trigger function
  const { triggerProfilePopup } = usePopup();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const authBase = `${backendUrl}/api/user`;

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    try {
      setLoading(true);
      if (currentState === "Sign Up") {
        const response = await axios.post(`${authBase}/register`, { name, email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          
          // 3. Trigger the Pink Profile Popup (Animation + Redirect)
          triggerProfilePopup();
          
        } else {
          setErrorMsg(response.data.message);
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(`${authBase}/login`, { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          
          // 3. Trigger the Pink Profile Popup (Animation + Redirect)
          triggerProfilePopup();

        } else {
          setErrorMsg(response.data.message);
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Added 'relative z-10' to ensure inputs are clickable above background elements
    <section className="flex flex-col items-center justify-center w-[90%] sm:max-w-md m-auto mt-32 pt-5 text-gray-800 relative z-10">
      <div className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        <form onSubmit={onSubmitHandler} className="w-full">
          <div className="inline-flex items-center gap-2 mb-4">
            <p className="prata-regular text-3xl">{currentState}</p>
            <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
          </div>

          {currentState === "Sign Up" && (
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              type="text" 
              name="name"              // Added name for browser autofill
              autoComplete="name"      // Helps browser identify field
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 bg-white/40 focus:outline-none focus:ring-1 focus:ring-pink-400" 
              placeholder="Name" 
              required 
            />
          )}
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            type="email" 
            name="email"               // Added name
            autoComplete="email"       // Helps browser identify field
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 bg-white/40 focus:outline-none focus:ring-1 focus:ring-pink-400" 
            placeholder="Email" 
            required 
          />
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            type="password" 
            name="password"            // Added name
            autoComplete="current-password" // Helps browser identify field
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 bg-white/40 focus:outline-none focus:ring-1 focus:ring-pink-400" 
            placeholder="Password" 
            required 
          />

          <div className="w-full flex justify-between text-sm mt-[-4px]">
            <p onClick={() => navigate("/forgot")} className="cursor-pointer text-blue-600 hover:underline">Forgot Password?</p>
            {currentState === "Login" ? (
              <p onClick={() => { setCurrentState("Sign Up"); setErrorMsg(""); }} className="cursor-pointer text-blue-600 hover:underline">Create account</p>
            ) : (
              <p onClick={() => { setCurrentState("Login"); setErrorMsg(""); }} className="cursor-pointer text-blue-600 hover:underline">Login Here</p>
            )}
          </div>

          {errorMsg && <p className="mt-3 text-xs text-red-600 leading-snug">{errorMsg}</p>}

          <div className="mt-6">
            <button type="submit" disabled={loading} className="w-full bg-black text-white font-light px-8 py-3 rounded-lg transition-all duration-500 hover:bg-gray-800 disabled:opacity-60">
              {loading ? "Please wait..." : currentState === "Login" ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;