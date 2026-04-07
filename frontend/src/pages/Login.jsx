// frontend/src/pages/Login.jsx
import React, { useContext, useEffect, useState } from "react";
import { SalonContext } from "../context/SalonContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, Scissors } from "lucide-react";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, setUser, backendUrl } = useContext(SalonContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      setLoading(true);
      const authBase = `${backendUrl}/api/user`;

      if (currentState === "Sign Up") {
        const res = await axios.post(`${authBase}/register`, { name, email, password, role });
        if (res.data.success) {
          setToken(res.data.token);
          setUser(res.data.user);
          localStorage.setItem("token", res.data.token);
          toast.success("Welcome to Book.My.Glow! 🎉");
          navigate("/dashboard");
        } else {
          setErrorMsg(res.data.message);
          toast.error(res.data.message);
        }
      } else {
        const res = await axios.post(`${authBase}/login`, { email, password });
        if (res.data.success) {
          setToken(res.data.token);
          setUser(res.data.user);
          localStorage.setItem("token", res.data.token);
          toast.success("Welcome back! 💫");

          // Role-based redirect
          const userRole = res.data.user?.role;
          if (userRole === "artist") navigate("/artist-dashboard");
          else navigate("/dashboard");
        } else {
          setErrorMsg(res.data.message);
          toast.error(res.data.message);
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#FFFBFA] relative overflow-hidden selection:bg-rose-100">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-rose-500/5 blur-[150px] -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-rose-200/10 blur-[120px] -mr-64 -mb-64 pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-rose-50 rounded-[3.5rem] shadow-2xl shadow-rose-500/5 p-10 sm:p-14 relative group">
        
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-rose-500/20 group-hover:rotate-12 transition-transform duration-700">
             <ShieldCheck size={28} />
          </div>
          <h1 className="text-4xl font-black text-rose-950 uppercase tracking-tight mb-3">
            {currentState === "Login" ? "Establish Session" : "Join the Elite"}
          </h1>
          <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
            {currentState === "Login"
              ? "Access your premium profile"
              : "Register your corporate identity"}
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-6 relative z-10">
          {currentState === "Sign Up" && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
               <div>
                <label className="block text-[9px] font-black text-rose-600/60 uppercase tracking-widest mb-3 ml-1 leading-none">Full Identity</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  required
                  placeholder="Official Name"
                  className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all placeholder:text-rose-950/20 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-rose-600/60 uppercase tracking-widest mb-3 ml-1 leading-none">Access Level</label>
                <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { value: "customer", label: "Privileged Client", desc: "Access primary booking" },
                      { value: "salonOwner", label: "Studio Proprietor", desc: "Manage workstation hub" },
                    ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`p-5 rounded-2xl border transition-all text-left relative overflow-hidden group/btn ${
                        role === option.value
                          ? "bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-500/20"
                          : "bg-[#FFFBFA] border-rose-100 hover:border-rose-300"
                      }`}
                    >
                      <p className={`text-[10px] font-black uppercase tracking-widest ${role === option.value ? 'text-white' : 'text-rose-950'}`}>{option.label}</p>
                      <p className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${role === option.value ? 'text-white/60' : 'text-rose-950/30'}`}>{option.desc}</p>
                      {role === option.value && <UserCheck size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="animate-in fade-in duration-700">
            <label className="block text-[9px] font-black text-rose-600/60 uppercase tracking-widest mb-3 ml-1 leading-none">Secure Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="ENTER EMAIL ADDRESS"
              className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all placeholder:text-rose-950/20 shadow-inner"
            />
          </div>

          <div className="animate-in fade-in duration-700">
            <label className="block text-[9px] font-black text-rose-600/60 uppercase tracking-widest mb-3 ml-1 leading-none">Secret Path</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={currentState === "Login" ? "current-password" : "new-password"}
              required
              placeholder="••••••••••••"
              className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all placeholder:text-rose-950/20 shadow-inner"
            />
          </div>

          {currentState === "Login" && (
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => navigate("/forgot")}
                className="text-[9px] font-black text-rose-950/30 hover:text-rose-600 uppercase tracking-widest transition-colors leading-none"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="text-[9px] font-black text-red-600 bg-red-50 px-4 py-4 rounded-xl border border-red-100 uppercase tracking-widest text-center animate-shake leading-tight">
               {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 text-white font-black py-5 rounded-2xl hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em] disabled:opacity-50 mt-4 active:scale-95"
          >
            {loading ? (
              "SYNCHRONIZING..."
            ) : (
              currentState === "Login" ? "Establish Identity" : "Launch Profile"
            )}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center mt-12 relative z-10 border-t border-rose-50 pt-8">
          {currentState === "Login" ? (
            <p className="text-[9px] font-black text-rose-950/30 uppercase tracking-widest leading-none">
              New Recuit?{" "}
              <button onClick={() => { setCurrentState("Sign Up"); setErrorMsg(""); }} className="text-rose-600 hover:text-rose-950 transition-colors ml-2 font-black italic">
                Register Here
              </button>
            </p>
          ) : (
            <p className="text-[9px] font-black text-rose-950/30 uppercase tracking-widest leading-none">
              Existing Member?{" "}
              <button onClick={() => { setCurrentState("Login"); setErrorMsg(""); }} className="text-rose-600 hover:text-rose-950 transition-colors ml-2 font-black italic">
                Authorize Access
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Login;