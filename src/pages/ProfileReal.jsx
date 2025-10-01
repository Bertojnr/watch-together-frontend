
// import { useState, useEffect, useContext } from "react";
// import api from "../api/api";
// import { AuthContext } from "../context/AuthContext";
// import toast from "react-hot-toast";

// export default function Profile() {
//   const { user } = useContext(AuthContext);

//   const [profile, setProfile] = useState(null);
//   const [bio, setBio] = useState("");
//   const [avatar, setAvatar] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Load profile on mount
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await api.get("/users/me");
//         setProfile(res.data);
//         setBio(res.data.bio || "");
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load profile");
//       }
//     };
//     fetchProfile();
//   }, []);

//   const handleFileChange = (e) => {
//     setAvatar(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       if (bio) formData.append("bio", bio);
//       if (avatar) formData.append("avatar", avatar);

//       const res = await api.patch("/users/me", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setProfile(res.data);
//       toast.success("Profile updated");
//     } catch (err) {
//       console.error(err);
//       toast.error("Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!profile) {
//     return <div className="text-center p-10">Loading profile...</div>;
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
//       <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
//         <h2 className="text-2xl mb-4 font-bold text-center">Your Profile</h2>

//         <div className="flex flex-col items-center mb-4">
//           <img
//             src={profile.avatarUrl || "https://via.placeholder.com/100"}
//             alt="Avatar"
//             className="w-24 h-24 rounded-full mb-2 object-cover"
//           />
//           <p className="text-xl font-semibold">{profile.username}</p>
//           <p className="text-gray-600">{profile.email}</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block mb-1 font-medium">Bio</label>
//             <textarea
//               className="w-full p-2 border rounded"
//               value={bio}
//               onChange={(e) => setBio(e.target.value)}
//               rows="3"
//             ></textarea>
//           </div>

//           <div>
//             <label className="block mb-1 font-medium">Update Avatar</label>
//             <input type="file" accept="image/*" onChange={handleFileChange} />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
//             disabled={loading}
//           >
//             {loading ? "Updating..." : "Update Profile"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
