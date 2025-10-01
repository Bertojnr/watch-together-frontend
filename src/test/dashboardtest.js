// import { useState, useContext } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// export default function Dashboard() {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     videoUrl: "",
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post("/rooms", formData);
//       const roomId = res.data.roomId || res.data.id; // depending on your backend response
//       navigate(`/watchroom/${roomId}`);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to create room");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
//       <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-6 rounded shadow-md w-full max-w-md"
//       >
//         {error && (
//           <p className="text-red-500 mb-4 text-center">{error}</p>
//         )}
//         <input
//           className="w-full mb-3 p-2 border rounded"
//           placeholder="Room Name"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//         />
//         <input
//           className="w-full mb-3 p-2 border rounded"
//           placeholder="YouTube URL"
//           name="videoUrl"
//           value={formData.videoUrl}
//           onChange={handleChange}
//           required
//         />
//         <button
//           type="submit"
//           className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
//         >
//           Create Room
//         </button>
//       </form>
//     </div>
//   );
// }
