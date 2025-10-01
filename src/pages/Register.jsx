import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'


export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", formData);
      toast.success('Registration Successful')
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      toast.error('Registration failed')
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-4 font-bold text-center">Register</h2>
        {error && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}
        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
