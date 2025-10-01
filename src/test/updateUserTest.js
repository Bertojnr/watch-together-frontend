import { UsersIcon, FilmIcon, Clock, Camera, History, Play, UserPlus, Star, Clapperboard } from "lucide-react";
import Navbar from "../components/Navbar";
import UserImage from '../assets/userid.avif';
import Movie1Image from '../assets/movie1.jpg';
import Movie2Image from '../assets/movie2.jpg';
import Movie3Image from '../assets/movie3.jpg';
import Footer from "../components/Footer";
import { useState } from "react";
import { apiClient,apiFetcher  } from "../../api/client";
import useSWR from "swr";
import { BeatLoader } from "react-spinners";





export default function Profile() {
  const [isModalOpen, setIsModalOpen] = useState(false);
 

  const OpenModal = () => setIsModalOpen(true);
  const CloseModal = () => setIsModalOpen(false);

 // Fetching data from backend
  const { data, isLoading, error } = useSWR("users/me", apiFetcher)


  // Update data to Backend
  const UpdateUser = async (data) => {
    // Update data to API 
    try {
      const response = await apiClient.patch("users/me",data, {
        headers: {
          Authorization:`Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
        }
      });
      console.table(response.data)
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return (
      <div>
        <BeatLoader size={100} />
      </div>
    )
  }

  if (error) {
    return (
      <div><p>Something went wrong</p></div>
    )
  }


 

  
  






  return (

    <div className="bg-[#0F172A]">
     
       <Navbar   />
     
      <div className="flex flex-col md:flex-row bg-gradient-to-r from-purple-600 to-cyan-500 justify-between items-center mt-10 rounded-xl p-6  w-[90%] mx-auto shadow-md ">
        <div className="flex items-center gap-6">
          <div className="relative" >
           <img src={UserImage} alt="User Id" className="w-20 h-20 rounded-full object-cover border border-white shadow-md" />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <input type="file" accept="image/*" className="w-full h-full opacity-0 absolute cursor-pointer" name="" id="" />
            <span className="text-xs text-black"> <Camera /> </span>
            </div>
          </div>
          <div className="flex flex-col text-white ">
            <h2 className="font-bold text-lg">Alex Johnson</h2>
            <p className="">Movie enthusiast & binge watcher extraordinare</p>
            <div className="flex flex-col md:flex-row  gap-2 p-2">
              <span className="flex flex-row">
                <FilmIcon  />
                <p>89 Movies watched</p>
              </span>
              <span className="flex flex-row">
                <Clock />
                <p>342 Hours</p>
              </span>

            </div>
          </div>
        </div>
        <div>
          <button className="bg-white px-6 py-2 m-4 rounded text-[#4F84E7] hover:text-blue-950" onClick={OpenModal}>Edit Profile</button>
        </div>
      </div>

      {isModalOpen && (
  <div
    className="fixed inset-0 bg-gradient-to-br from-purple-400 to-white bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
    onClick={CloseModal}
  >
    <div
      className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
    >
            {/* This is the modal content  */}
            <form action={UpdateUser} className="flex flex-col gap-5 ">
              <h2 className="text-xl font-semibold text-purple-700 ">Update Profile</h2>
              <input type="file"
                // accept="image/*"
                name="avatar"
                id="avatar"
                
              
                className="w-full px-4 py-2 bg-white rounded border border-[#9333EA]"
                
                placeholder="Update avatar" />
              <textarea name="bio" id="bio" placeholder="Update your bio..." 
 className="w-full h-32 px-4 py-2 bg-white border border-[#9333EA] resize-none"></textarea>
              <button type="submit" className="px-6 py-2 text-white bg-[#9333EA] font-medium rounded" >Done</button>
            </form>
      
    </div>
  </div>
)}
    
      <section className="bg-[#1E293B] flex flex-col justify-between gap-5 w-[90%] mx-auto mt-10 rounded p-4">
        <div className="flex items-center gap-2 p-2">
          <History className="text-[#9333EA]" />
          <h1 className="text-white text-2xl">Recent Activity</h1>
        </div>
        <div className="bg-[#0F172A] w-[90%] mx-auto flex items-center gap-2 p-2 rounded">
        <div className="bg-[#9333EA] p-1.5 rounded">
            <Play  className="w-5 h-5 "/>
        </div>
        <div className="text-white">
          <h2>Watched "Faults in Our Stars" </h2>
          <p>2 Hours</p>
        </div>
        </div>

        <div className="bg-[#0F172A] w-[90%] mx-auto flex items-center gap-2 p-2 rounded">
       <div className="bg-[#9333EA] p-1.5  rounded">
           <Star  className="w-5 h-5 "/>
       </div>
        <div className="text-white">
          <h2>Rated 'Now You See Me' 5 stars </h2>
          <p>3 days ago</p>
        </div>
        </div>
      </section>
      <section className="bg-[#1E293B] p-4 w-[90%] mx-auto mt-8">
    <div className="flex items-center gap-2 text-white p-2">
      <Clapperboard className= "text-[#9333EA] " />
      <h2 className="font-bold text-xl ">Recently watched</h2>
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