import { useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaLock } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", formData);
      login(res.data);
      toast.success("Login Successful");
      const redirectTo = localStorage.getItem("redirectAfterLogin") || "/dashboard";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      toast.error("Login Failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-xl flex flex-col gap-4"
      >
        <div className="flex justify-center mb-4">
          <FaLock className="text-4xl text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Login</h2>
        <p className="text-center text-gray-500 mb-4">Welcome back! Please enter your credentials.</p>

        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

        <input
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white p-3 rounded font-semibold hover:bg-purple-700 transition-colors"
        >
          Login
        </button>
      </form>

      <footer className="mt-6 text-white opacity-80 text-sm">
        © {new Date().getFullYear()} My Watch Room App 🚀
      </footer>
    </div>
  );
}
