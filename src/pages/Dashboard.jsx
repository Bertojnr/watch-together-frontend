import { useState, useContext, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FaUserCircle, FaSignOutAlt, FaVideo, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    videoUrl: "",
  });

  const [error, setError] = useState("");
  const [activeRooms, setActiveRooms] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/rooms", formData);
      const roomId = res.data.roomId || res.data.id;
      toast.success("Room Created");
      navigate(`/watchroom/${roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
      toast.error("Failed to Create Room");
    }
  };

  useEffect(() => {
    const fetchActiveRooms = async () => {
      try {
        const res = await api.get("/rooms/active");
        setActiveRooms(res.data);
      } catch (err) {
        console.error("Failed to get active rooms:", err);
      }
    };

    fetchActiveRooms();
    const interval = setInterval(fetchActiveRooms, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col">
      <Link to="/profile" className="text-blue-600 hover:underline">My Profile</Link>
      {/* Topbar */}
      <header className="w-full flex items-center justify-between bg-white shadow px-6 py-4">
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-3xl text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{user?.username}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
        >
          <FaSignOutAlt /> Logout
        </button>
      </header>

      {/* Content */}
      <main className="flex flex-col items-center flex-grow p-6">
        {/* Hero */}
        <div className="text-center text-white mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Welcome to your Dashboard</h1>
          <p className="text-lg opacity-80">Create a watch room & invite your friends 🎥</p>
        </div>

        {/* Form */}
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <FaPlus className="text-purple-600" /> Create New Room
          </h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Room Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="YouTube URL"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 transition-colors"
            >
              Create Room
            </button>
          </form>
        </div>

        {/* Active Rooms */}
        <div className="w-full max-w-5xl">
          <h2 className="text-2xl text-white mb-4 font-bold">Active Rooms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activeRooms?.rooms?.length > 0 ? (
              activeRooms.rooms.map((r) => (
                <div
                  key={r.roomId}
                  onClick={() => navigate(`/watchroom/${r.roomId}`)}
                  className="bg-white p-5 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow flex items-center gap-4"
                >
                  <FaVideo className="text-purple-600 text-3xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{r.name}</h3>
                    <p className="text-sm text-gray-600">{r.usersOnline} watching</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white opacity-80">No active rooms at the moment.</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-white py-4 opacity-80 text-sm">
        © {new Date().getFullYear()} My Watch Room App 🚀
      </footer>
    </div>
  );
}
