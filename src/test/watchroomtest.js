// import { useEffect, useState, useContext, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import socket from "../socket/socket";
// import { AuthContext } from "../context/AuthContext";

// const formatTime = (isoString) => {
//   const date = new Date(isoString);
//   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// };

// export default function WatchRoom() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);

//   const [room, setRoom] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [usersWatching, setUsersWatching] = useState(0);
//   const [copied, setCopied] = useState(false);

//   const messagesEndRef = useRef(null);
//   const playerRef = useRef(null);
//   const inviteLink = `${window.location.origin}/watchroom/${id}`;

//   useEffect(() => {
//     let isMounted = true;

//     const init = async () => {
//       try {
//         const roomRes = await api.get(`/rooms/${id}`);
//         const messagesRes = await api.get(`/rooms/${id}/messages`);

//         if (isMounted) {
//           setRoom(roomRes.data);
//           setMessages(messagesRes.data);

//           socket.auth = { token: localStorage.getItem("token") };
//           socket.connect();
//           socket.emit("joinRoom", { roomId: id, username: user.username });

//           socket.on("chat:message", handleMessage);
//           socket.on("room:systemMessage", handleSystemMessage);
//           socket.on("room:usersUpdate", ({ count }) => setUsersWatching(count));
//           socket.on("video:play", handlePlay);
//           socket.on("video:pause", handlePause);
//           socket.on("video:seek", handleSeek);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     init();

//     return () => {
//       isMounted = false;
//       socket.off("chat:message", handleMessage);
//       socket.off("room:systemMessage", handleSystemMessage);
//       socket.off("room:usersUpdate");
//       socket.off("video:play", handlePlay);
//       socket.off("video:pause", handlePause);
//       socket.off("video:seek", handleSeek);
//       socket.disconnect();
//     };
//   }, [id, user.username]);

//   const handleMessage = (message) => {
//     setMessages((prev) => [...prev, message]);
//   };

//   const handleSystemMessage = ({ message, timestamp }) => {
//     setMessages((prev) => [...prev, { system: true, message, timestamp }]);
//   };

//   const handlePlay = ({ time }) => {
//     if (playerRef.current) {
//       playerRef.current.seekTo(time, true);
//       playerRef.current.playVideo();
//     }
//   };

//   const handlePause = ({ time }) => {
//     if (playerRef.current) {
//       playerRef.current.seekTo(time, true);
//       playerRef.current.pauseVideo();
//     }
//   };

//   const handleSeek = ({ time }) => {
//     if (playerRef.current) {
//       playerRef.current.seekTo(time, true);
//     }
//   };

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
//     }
//   }, [messages]);

//   useEffect(() => {
//     if (!room) return;

//     const tag = document.createElement("script");
//     tag.src = "https://www.youtube.com/iframe_api";
//     const firstScriptTag = document.getElementsByTagName("script")[0];
//     firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//     window.onYouTubeIframeAPIReady = () => {
//       playerRef.current = new window.YT.Player("player", {
//         height: "450",
//         width: "800",
//         videoId: room.videoId,
//         events: {
//           onStateChange: onPlayerStateChange,
//         },
//       });
//     };

//     const onPlayerStateChange = (event) => {
//       const player = playerRef.current;
//       if (!player) return;

//       const time = player.getCurrentTime();

//       if (event.data === window.YT.PlayerState.PLAYING) {
//         socket.emit("video:play", { roomId: id, time });
//       }
//       if (event.data === window.YT.PlayerState.PAUSED) {
//         socket.emit("video:pause", { roomId: id, time });
//       }
//     };

//     return () => {
//       window.onYouTubeIframeAPIReady = null;
//     };
//   }, [room, id]);

//   const sendMessage = () => {
//     if (newMessage.trim()) {
//       socket.emit("chat:message", {
//         roomId: id,
//         message: newMessage,
//         userId: user.id,
//         username: user.username,
//       });
//       setNewMessage("");
//     }
//   };

//   const copyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(inviteLink);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error("Copy failed:", err);
//     }
//   };

//   const leaveRoom = () => {
//     socket.disconnect();
//     navigate("/dashboard");
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
//       {room && (
//         <>
//           <div className="mb-4">
//             <h1 className="text-2xl">{room.name}</h1>
//             <p className="text-sm text-gray-400">{usersWatching} watching</p>
//             <div className="flex items-center gap-2 mt-2">
//               <button
//                 onClick={leaveRoom}
//                 className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-xs"
//               >
//                 Leave Room
//               </button>
//               <h1>Wanna Invite Friend's? Just Send them this link</h1>
//               <input
//                 readOnly
//                 value={inviteLink}
//                 className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded w-64"
//               />
//               <button
//                 onClick={copyLink}
//                 className="bg-blue-600 px-2 py-1 text-xs rounded hover:bg-blue-700"
//               >
//                 {copied ? "Copied!" : "Copy"}
//               </button>
//             </div>
//           </div>

//           <div className="flex flex-col lg:flex-row gap-4 w-full">
//             {/* Video Section */}
//             <div className="flex-1 flex justify-center">
//               <div id="player" className="rounded overflow-hidden"></div>
//             </div>

//             {/* Chat Sidebar */}
//             <div className="w-full lg:w-1/3 bg-gray-800 p-4 rounded shadow-md flex flex-col">
//               <div
//                 className="flex-1 overflow-y-auto mb-4"
//                 ref={messagesEndRef}
//               >
//                 {messages.map((msg, idx) => (
//                   <div
//                     key={idx}
//                     className={`mb-2 shadow transition flex ${
//                       msg.system
//                         ? "justify-center"
//                         : msg.username === user.username
//                         ? "justify-end"
//                         : "justify-start"
//                     }`}
//                   >
//                     <div
//                       className={`p-3 rounded-lg break-words w-fit max-w-xs ${
//                         msg.system
//                           ? "bg-yellow-500 text-black text-center font-semibold"
//                           : msg.username === user.username
//                           ? "bg-blue-600 text-white rounded-br-none"
//                           : "bg-gray-700 text-white rounded-bl-none"
//                       }`}
//                     >
//                       {msg.system ? (
//                         <div className="text-sm italic">{msg.message}</div>
//                       ) : (
//                         <>
//                           <div
//                             className={`text-sm mb-1 font-medium ${
//                               msg.username === user.username
//                                 ? "text-blue-200"
//                                 : "text-green-300"
//                             }`}
//                           >
//                             {msg.username}
//                           </div>
//                           <div>{msg.message}</div>
//                           <div className="text-xs text-gray-300 text-right mt-1">
//                             {formatTime(msg.timestamp || msg.createdAt)}
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="flex">
//                 <input
//                   type="text"
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       sendMessage();
//                     }
//                   }}
//                   className="flex-1 p-2 rounded-l bg-gray-700"
//                   placeholder="Type your message..."
//                 />
//                 <button
//                   onClick={sendMessage}
//                   className="bg-blue-600 px-4 py-2 rounded-r hover:bg-blue-700"
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
