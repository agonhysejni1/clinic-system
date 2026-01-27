// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@clinic.test");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    const { ok, error } = await login(email, password);
    setLoading(false);
    if (!ok) {
      setErrMsg(error?.message || "Login failed");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-white">Login</h2>
        {errMsg && <div className="bg-red-600 p-2 mb-4 rounded">{errMsg}</div>}
        <label className="block mb-2 text-gray-200">Email</label>
        <input
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="block mb-2 text-gray-200">Password</label>
        <input
          type="password"
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
