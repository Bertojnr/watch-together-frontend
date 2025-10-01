import React, { useState, useEffect, useContext, useRef } from "react";
import { FilmIcon, Clock, Camera, History, Play, Star, Clapperboard } from "lucide-react";
// import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast"; // Using toast for notifications as per the first code block
import api from "../api/api"; // Assuming this is your configured axios instance
// import UserImage from '../assets/userid.avif'; // Keep static images for placeholders/defaults
// import Movie1Image from '../assets/movie1.jpg';
// import Movie2Image from '../assets/movie2.jpg';
// import Movie3Image from '../assets/movie3.jpg';

export default function Profile() {
  const { user: authUser } = useContext(AuthContext); // Get user from AuthContext
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null); // File object for new avatar
  const [loading, setLoading] = useState(false); // For form submission loading
  const [isModalOpen, setIsModalOpen] = useState(false); // For edit profile modal
  const avatarFileInputRef = useRef(null); // Ref for the file input in the modal

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfile(res.data);
        setBio(res.data.bio || ""); // Initialize bio state with fetched bio
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]); // Set the selected file to state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (bio) formData.append("bio", bio);
      if (avatar) formData.append("avatar", avatar);

      const res = await api.patch("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(res.data); // Update profile state with the new data
      toast.success("Profile updated");
      setIsModalOpen(false); // Close modal on success
      setAvatar(null); // Clear selected avatar after upload
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // If profile data is still loading
  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0F172A] text-white">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Use `profile` state for display, which is updated after fetch and successful patch
  const currentUserProfile = profile;

  return (
    <div className="bg-[#0F172A]">
      <Navbar />

      <div className="flex flex-col md:flex-row bg-gradient-to-r from-purple-600 to-cyan-500 justify-between items-center mt-10 rounded-xl p-6 w-[90%] mx-auto shadow-md">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={currentUserProfile.avatarUrl || UserImage}
              alt="User Avatar"
              className="w-20 h-20 rounded-full object-cover border border-white shadow-md"
            />
            {/* The camera icon and file input are now part of the modal for clarity,
                but keeping the visual for now if needed outside the modal */}
            {/* <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <input type="file" accept="image/*" className="w-full h-full opacity-0 absolute cursor-pointer" />
              <span className="text-xs text-black"> <Camera /> </span>
            </div> */}
          </div>
          <div className="flex flex-col text-white">
            <h2 className="font-bold text-lg">{currentUserProfile.username}</h2>
            <p className="">{currentUserProfile.bio || 'No bio provided'}</p>
            <div className="flex flex-col md:flex-row gap-2 p-2">
              <span className="flex flex-row">
                <FilmIcon />
                <p>{currentUserProfile.moviesWatched || 0} Movies watched</p>
              </span>
              <span className="flex flex-row">
                <Clock />
                <p>{currentUserProfile.hoursWatched || 0} Hours</p>
              </span>
            </div>
          </div>
        </div>
        <div>
          <button
            className="bg-white px-6 py-2 m-4 rounded text-[#4F84E7] hover:text-blue-950"
            onClick={() => setIsModalOpen(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-purple-400 to-white bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold text-purple-700">Update Profile</h2>
              <input
                type="file"
                name="avatar"
                id="avatar"
                ref={avatarFileInputRef} // Use ref here, but handle change via state
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-white rounded border border-[#9333EA]"
              />
              <textarea
                name="bio"
                id="bio"
                placeholder="Update your bio..."
                value={bio} // Controlled component for bio
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-32 px-4 py-2 bg-white border border-[#9333EA] resize-none"
              ></textarea>
              <button
                type="submit"
                className="px-6 py-2 text-white bg-[#9333EA] font-medium rounded disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Updating..." : "Done"}
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="bg-[#1E293B] flex flex-col justify-between gap-5 w-[90%] mx-auto mt-10 rounded p-4">
        <div className="flex items-center gap-2 p-2">
          <History className="text-[#9333EA]" />
          <h1 className="text-white text-2xl">Create a Virtual Room on the Dashboard</h1>
        </div>
        <div className="bg-[#0F172A] w-[90%] mx-auto flex items-center gap-2 p-2 rounded">
          <div className="bg-[#9333EA] p-1.5 rounded">
            <Play className="w-5 h-5 " />
          </div>
          <div className="text-white">
            <h2>Watched "Faults in Our Stars" with Friends in real time </h2>
          </div>
        </div>

        <div className="bg-[#0F172A] w-[90%] mx-auto flex items-center gap-2 p-2 rounded">
          <div className="bg-[#9333EA] p-1.5 rounded">
            <Star className="w-5 h-5 " />
          </div>
          <div className="text-white">
            <h2>Share Your Opinions about the movie in our group chat </h2>
          </div>
        </div>
      </section>

      <section className="bg-[#1E293B] p-4 w-[90%] mx-auto mt-8">
        <div className="flex items-center gap-2 text-white p-2">
          <Clapperboard className="text-[#9333EA]" />
          <h2 className="font-bold text-xl ">Recommended Movies</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center pt-6 gap-10 w-[90%] mx-auto text-white">
          <div className="w-64 rounded-lg overflow-hidden shadow-md">
            <img src={Movie1Image} alt="" className="w-full h-96 object-cover" />
            <div className="p-4">
              <h2 className=" font-bold text-lg text-white ">Faults in Our Stars</h2>
              <p className="text-sm text-gray-600">Romance . 2014</p>
            </div>
          </div>
          <div className="w-64 rounded-lg overflow-hidden shadow-md ">
            <img src={Movie2Image} alt="" className="w-64 object-cover h-96" />
            <div className="p-4">
              <h2 className="font-bold text-lg text-white">Kpop Demon Hunter</h2>
              <p className="text-sm text-gray-600">Animation . 2025</p>
            </div>
          </div>
          <div className="w-64 rounded-lg overflow-hidden shadow-md ">
            <img src={Movie3Image} alt="" className="w-full object-cover h-96" />
            <div className="p-4">
              <h2 className="font-bold text-lg text-white">Now You See Me</h2>
              <p className="text-sm text-gray-600">Thriller . 2013</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}