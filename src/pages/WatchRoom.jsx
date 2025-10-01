import { useEffect, useState, useContext, useRef } from "react"; // Import React hooks for managing component lifecycle, state, context, and references
import { useParams, useNavigate } from "react-router-dom"; // Import hooks from React Router for accessing URL parameters and navigation
import api from "../api/api"; // Import your custom API client for making HTTP requests
import socket from "../socket/socket"; // Import your Socket.IO client for real-time communication
import { AuthContext } from "../context/AuthContext"; // Import the authentication context to access user information
import toast from "react-hot-toast";

// Helper function to format an ISO date string into a user-friendly time string (e.g., "02:30 PM")
const formatTime = (isoString) => {
  const date = new Date(isoString); // Create a Date object from the ISO string
  // Use toLocaleTimeString to get a formatted time, specifying 2-digit hour and minute
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Main functional component for the Watch Room page
export default function WatchRoom() {
  // useParams hook extracts dynamic parameters from the URL (e.g., "/watchroom/:id" will give you the 'id')
  const { id } = useParams();
  // useNavigate hook provides a function to programmatically navigate to different routes
  const navigate = useNavigate();
  // useContext hook accesses the value from the nearest AuthContext Provider (which holds user data)
  const { user } = useContext(AuthContext);

  // State variables to manage the component's data
  const [room, setRoom] = useState(null); // Stores details of the current watch room (e.g., name, videoId)
  const [messages, setMessages] = useState([]); // Stores chat messages for the room
  const [newMessage, setNewMessage] = useState(""); // Stores the text currently being typed in the chat input
  const [usersWatching, setUsersWatching] = useState(0); // Stores the count of users currently in the room
  const [copied, setCopied] = useState(false); // State to show "Copied!" feedback when invite link is copied
  const [activeRooms, setActiveRooms] = useState([]); // NEW

  // useRef hook creates a mutable ref object whose .current property is initialized to the passed argument.
  // These refs are used to directly interact with DOM elements or persist values across renders without causing re-renders.
  const messagesEndRef = useRef(null); // Ref for the chat messages container, used to auto-scroll to the bottom
  const playerRef = useRef(null); // Ref for the YouTube player instance, used to control video playback
  // Constructs the invite link for the current room
  const inviteLink = `${window.location.origin}/watchroom/${id}`;

  // This ref is specifically for measuring the height of the header section dynamically
  const headerRef = useRef(null);
  // State to store the measured height of the header, used for layout calculations
  const [headerHeight, setHeaderHeight] = useState(0);

  // useEffect hook for measuring the header height
  // This runs once after the initial render and again on window resize
  useEffect(() => {
    // Function to get the current height of the header element
    const measureHeader = () => {
      if (headerRef.current) {
        // If the ref is attached to a DOM element, get its offsetHeight
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    measureHeader(); // Call it immediately after component mounts to get initial height
    // Add an event listener to recalculate height whenever the window is resized
    window.addEventListener('resize', measureHeader);

    // Cleanup function: This runs when the component unmounts
    return () => {
      // Remove the event listener to prevent memory leaks
      window.removeEventListener('resize', measureHeader);
    };
  }, []); // Empty dependency array means this effect runs only once after the initial render and cleans up on unmount.

  // useEffect hook for initializing the room data and setting up Socket.IO listeners
  // This runs once when the component mounts and re-runs if 'id' or 'user.username' changes
  useEffect(() => {
    let isMounted = true; // Flag to track if the component is still mounted, preventing state updates on unmounted components

    // Asynchronous function to fetch room data and messages
    const init = async () => {
      try {
        // Fetch room details from your API
        const roomRes = await api.get(`/rooms/${id}`);
        // Fetch past messages for the room
        const messagesRes = await api.get(`/rooms/${id}/messages`);

        // Only update state if the component is still mounted
        if (isMounted) {
          setRoom(roomRes.data); // Set the room data
          setMessages(messagesRes.data); // Set the initial messages

          // Configure Socket.IO with the user's authentication token from localStorage
          socket.auth = { token: localStorage.getItem("token") };
          socket.connect(); // Connect to the Socket.IO server
          // Emit an event to join the specific room with the user's username
          socket.emit("joinRoom", { roomId: id, username: user.username });

          // Set up Socket.IO event listeners
          socket.on("chat:message", handleMessage); // Listen for new chat messages
          socket.on("room:systemMessage", handleSystemMessage); // Listen for system messages (e.e., user joined/left)
          socket.on("room:usersUpdate", ({ count }) => setUsersWatching(count)); // Listen for updates on users watching
          socket.on("video:play", handlePlay); // Listen for remote video play commands
          socket.on("video:pause", handlePause); // Listen for remote video pause commands
          socket.on("video:seek", handleSeek); // Listen for remote video seek commands
        }
      } catch (err) {
        // Log any errors that occur during API calls or Socket.IO setup
        if (err.response?.status === 401) {
          localStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login");
  } else {
        console.error(err);
  }
      }
    };

    init(); // Call the initialization function

    // Cleanup function: This runs when the component unmounts or before the effect re-runs
    return () => {
      isMounted = false; // Set the mounted flag to false
      // Turn off all Socket.IO listeners to prevent memory leaks and incorrect behavior
      socket.off("chat:message", handleMessage);
      socket.off("room:systemMessage", handleSystemMessage);
      socket.off("room:usersUpdate");
      socket.off("video:play", handlePlay);
      socket.off("video:pause", handlePause);
      socket.off("video:seek", handleSeek);
      socket.disconnect(); // Disconnect from the Socket.IO server
    };
  }, [id, user.username]); // Dependencies: Effect re-runs if 'id' or 'user.username' changes


   // 🆕 Fetch active rooms every few seconds
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
    const interval = setInterval(fetchActiveRooms, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Callback function to handle incoming chat messages
  const handleMessage = (message) => {
    // Update the messages state by adding the new message to the end of the existing array
    setMessages((prev) => [...prev, message]);
  };

  // Callback function to handle incoming system messages (e.g., user joined/left)
  const handleSystemMessage = ({ message, timestamp }) => {
    // Add system messages to the messages state, marked with 'system: true'
    setMessages((prev) => [...prev, { system: true, message, timestamp }]);
  };

  // Callback function to handle video play commands from other users
  const handlePlay = ({ time }) => {
    // Check if the YouTube player instance exists
    if (playerRef.current) {
      // Seek the video to the specified time and then play it
      playerRef.current.seekTo(time, true); // 'true' for seek to closest keyframe
      playerRef.current.playVideo();
    }
  };

  // Callback function to handle video pause commands from other users
  const handlePause = ({ time }) => {
    // Check if the YouTube player instance exists
    if (playerRef.current) {
      // Seek the video to the specified time and then pause it
      playerRef.current.seekTo(time, true);
      playerRef.current.pauseVideo();
    }
  };

  // Callback function to handle video seek commands from other users
  const handleSeek = ({ time }) => {
    // Check if the YouTube player instance exists
    if (playerRef.current) {
      // Seek the video to the specified time
      playerRef.current.seekTo(time, true);
    }
  };

  // useEffect hook to scroll the chat messages to the bottom whenever new messages arrive
  useEffect(() => {
    // Check if the messages container ref is present
    if (messagesEndRef.current) {
      // Set the scrollTop property to scroll to the very bottom of the element
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]); // Dependency: Effect runs whenever the 'messages' array updates

  // useEffect hook for loading the YouTube Iframe API and initializing the player
  // This runs when the component mounts and re-runs if 'room' or 'id' changes
  useEffect(() => {
    // Don't proceed if room data isn't available yet
    if (!room) return;

    // Create a script element for the YouTube Iframe API
    const tag = document.createElement("script");
    // Set the source of the script to the YouTube Iframe API URL
    tag.src = "https://www.youtube.com/iframe_api"; // URL for YouTube Iframe API
    // Get the first script tag in the document (usually in the <head>)
    const firstScriptTag = document.getElementsByTagName("script")[0];
    // Insert the YouTube API script before the first existing script tag
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // This global function is called by the YouTube Iframe API once it's loaded
    window.onYouTubeIframeAPIReady = () => {
      // Initialize the YouTube player instance
      playerRef.current = new window.YT.Player("player", {
        // 'player' is the ID of the HTML element where the video will be embedded
        videoId: room.videoId, // The YouTube video ID obtained from room data
        events: {
          // Listen for state changes in the player (e.g., playing, paused, buffering)
          onStateChange: onPlayerStateChange,
        },
      });
    };

    // Callback function for YouTube player state changes
    const onPlayerStateChange = (event) => {
      const player = playerRef.current; // Get the current player instance
      if (!player) return; // If player isn't ready, do nothing

      const time = player.getCurrentTime(); // Get the current playback time of the video

      // If the player starts playing, emit a 'video:play' event to the server
      if (event.data === window.YT.PlayerState.PLAYING) {
        socket.emit("video:play", { roomId: id, time });
      }
      // If the player pauses, emit a 'video:pause' event to the server
      if (event.data === window.YT.PlayerState.PAUSED) {
        socket.emit("video:pause", { roomId: id, time });
      }
      // If the player is buffering AND the current time has changed (indicating a seek),
      // emit a 'video:seek' event to synchronize other users
      if (event.data === window.YT.PlayerState.BUFFERING && player.getCurrentTime() !== time) {
         socket.emit("video:seek", { roomId: id, time: player.getCurrentTime() });
      }
    };

    // Cleanup function: This runs when the component unmounts
    return () => {
      // Clear the global YouTube API ready function to prevent issues if component unmounts and remounts
      window.onYouTubeIframeAPIReady = null;
    };
  }, [room, id]); // Dependencies: Effect re-runs if 'room' data or 'id' changes

  // Function to send a chat message
  const sendMessage = () => {
    // Only send if the message is not empty or just whitespace
    if (newMessage.trim()) {
      // Emit a 'chat:message' event to the server with message details
      socket.emit("chat:message", {
        roomId: id,
        message: newMessage,
        userId: user.id,
        username: user.username,
      });
      setNewMessage(""); // Clear the input field after sending
    }
  };

  // Function to copy the invite link to the clipboard
  const copyLink = async () => {
    try {
      // Use the Clipboard API to write the invite link to the clipboard
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true); // Set state to show "Copied!" feedback
      toast.success('Link Copied')
      // After 2 seconds, hide the "Copied!" feedback
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Log any errors if copying fails
      console.error("Copy failed:", err);
      toast.error('Copy Failed')
    }
  };

  // Function to leave the current room
  const leaveRoom = () => {
    socket.disconnect(); // Disconnect from the Socket.IO server
    navigate("/dashboard"); // Navigate the user back to the dashboard page
  };

  // The component's JSX (UI) structure
  return (
    // Main container for the entire page, styled with Tailwind CSS for dark background, text color, and padding
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
      {/* Conditionally render content only if room data has been loaded */}
      {room && (
        <>
          {/* Header section with room name, user count, and controls */}
          {/* ref={headerRef} attaches the ref to this div to measure its height */}
          <div className="mb-4" ref={headerRef}>
            <h1 className="text-2xl">{room.name}</h1> {/* Display room name */}
            <p className="text-sm text-gray-400">{usersWatching} watching</p> {/* Display number of users watching */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={leaveRoom}
                className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-xs" // Tailwind styles for a red "Leave Room" button
              >
                Leave Room
              </button>
              <h1>Wanna Invite Friend's? Just Send them this link</h1> {/* Invite link prompt */}
              <input
                readOnly // Make the input field read-only
                value={inviteLink} // Display the invite link
                className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded w-64" // Tailwind styles for the invite link input
              />
              <button
                onClick={copyLink}
                className="bg-blue-600 px-2 py-1 text-xs rounded hover:bg-blue-700" // Tailwind styles for a blue "Copy" button
              >
                {copied ? "Copied!" : "Copy"} {/* Button text changes based on 'copied' state */}
              </button>
            </div>
          </div>

          {/* Main content area: video and chat sections */}
          {/* Uses flexbox for layout, stacking on small screens (flex-col) and side-by-side on large screens (lg:flex-row) */}
          {/* gap-4 adds space between video and chat. w-full makes it take full width. */}
          {/* The height is dynamically calculated to fill the remaining viewport space below the header */}
          <div
            className="flex flex-col lg:flex-row gap-4 w-full"
            style={{ height: headerHeight ? `calc(100vh - ${headerHeight}px - 2rem)` : 'auto' }} // Calculates height: 100vh (viewport height) - header height - main container's vertical padding (2rem for p-4)
          >
            {/* Video Section */}
            {/* flex-1 allows this div to take up available space in the flex container */}
            {/* flex justify-center items-center centers the video. */}
            {/* max-h-[50vh] limits height on small screens. h-full ensures it matches chat height on large screens. */}
            <div className="flex-1 flex justify-center items-center max-h-[50vh] lg:max-h-full h-full">
              {/* Responsive video wrapper */}
              {/* relative w-full h-full makes it fill its parent. overflow-hidden for rounded corners. */}
              {/* pb-[56.25%] creates a 16:9 aspect ratio *padding-bottom* on small screens. */}
              {/* lg:pb-0 removes this padding on large screens, allowing h-full to make it fill the calculated height exactly. */}
              <div className="relative w-full h-full pb-[56.25%] lg:pb-0 overflow-hidden rounded shadow-lg">
                {/* The div where the YouTube iframe player will be embedded */}
                <div id="player" className="absolute top-0 left-0 w-full h-full"></div>
              </div>

              
            </div>



            {/* Chat Sidebar */}
            {/* w-full for small screens, lg:w-1/3 to take one-third width on large screens */}
            {/* bg-gray-800, p-4, rounded-lg, shadow-xl for overall chat box styling */}
            {/* flex flex-col makes it a flex container with vertical stacking */}
            {/* min-h-[400px] ensures a minimum height. max-h-[80vh] limits its max height on small screens. */}
            {/* h-full ensures it matches the video's height on large screens. */}
            
            <div className="w-full lg:w-1/3 bg-gray-800 p-4 rounded-lg shadow-xl flex flex-col min-h-[400px] max-h-[80vh] h-full">
            <h1>Live Chat🌟🔛💫</h1>
              {/* Chat messages area with internal scroll */}
              {/* flex-1 makes this section grow to fill available vertical space, pushing the input to the bottom. */}
              {/* overflow-y-auto enables vertical scrolling for messages if they exceed the container's height. */}
              {/* pr-2 adds padding to avoid scrollbar overlapping text. */}
              {/* scrollbar-thin, scrollbar-thumb-gray-600, scrollbar-track-gray-700 style the scrollbar (requires tailwind-scrollbar plugin) */}
              {/* ref={messagesEndRef} is used to programmatically scroll to the bottom */}
              <div
                className="flex-1 overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
                ref={messagesEndRef}
              >
                {/* Map through the messages array to display each message */}
                {messages.map((msg, idx) => (
                  <div
                    key={idx} // Unique key for each message, important for React list rendering
                    // Dynamic styling for message alignment (system messages centered, user's messages right, others' messages left)
                    className={`mb-2 flex ${
                      msg.system
                        ? "justify-center"
                        : msg.username === user.username
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {/* Individual message bubble styling */}
                    <div
                      className={`p-2 rounded-lg max-w-[80%] text-sm relative ${
                        msg.system // Styling for system messages (e.g., user joined/left)
                          ? "bg-yellow-500 text-black text-center font-semibold text-xs py-1 px-3 rounded-full"
                          : msg.username === user.username // Styling for current user's messages
                          ? "bg-blue-600 text-white rounded-br-none mr-2" // Blue background, no bottom-right border radius (for chat bubble "tail")
                          : "bg-gray-700 text-white rounded-bl-none ml-2" // Gray background, no bottom-left border radius
                      }`}
                    >
                      {msg.system ? (
                        // Render system message
                        <div className="text-sm italic">{msg.message}</div>
                      ) : (
                        // Render regular chat message
                        <>
                          <div
                            // Dynamic styling for username color and alignment
                            className={`font-medium ${
                              msg.username === user.username
                                ? "text-blue-200" // Lighter blue for current user's name
                                : "text-green-300" // Green for other users' names
                            } ${msg.username === user.username ? "text-right" : "text-left"} mb-0.5`}
                          >
                            {msg.username} {/* Display username */}
                          </div>
                          <div>{msg.message}</div> {/* Display message content */}
                          <div className="text-[10px] text-gray-300 text-right mt-1 opacity-80">
                            {formatTime(msg.timestamp || msg.createdAt)} {/* Display formatted time */}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input area */}
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage} // Binds the input value to the 'newMessage' state
                  onChange={(e) => setNewMessage(e.target.value)} // Updates 'newMessage' state as user types
                  onKeyDown={(e) => { // Handles key presses
                    if (e.key === "Enter") { // If Enter key is pressed
                      e.preventDefault(); // Prevent default Enter behavior (e.g., new line in textarea)
                      sendMessage(); // Call sendMessage function
                    }
                  }}
                  className="flex-1 p-3 rounded-l-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" // Tailwind styles for input
                  placeholder="Type your message..." // Placeholder text
                />
                <button
                  onClick={sendMessage} // Calls sendMessage function when button is clicked
                  className="bg-blue-600 px-5 py-3 rounded-r-lg hover:bg-blue-700 transition-colors duration-200" // Tailwind styles for send button
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* gggg */}
          {/* 🆕 Active Rooms Sidebar */}
      <div className="w-full lg:w-1/4 bg-gray-800 p-4 rounded shadow-md mt-4 lg:mt-0 lg:ml-4">
        <h2 className="text-xl mb-2">Active Rooms</h2>
        {activeRooms.rooms
          .filter(r => r.roomId == id)
          .map(r => (
            <div
              key={r.roomId}
              className="bg-gray-700 p-2 mb-2 rounded cursor-pointer hover:bg-gray-600"
              onClick={() => navigate(`/watchroom/${r.roomId}`)}
            >
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-gray-300">{r.usersOnline} watching</div>
            </div>
          ))}
        {activeRooms.rooms.length <= 1 && (
          <div className="text-gray-400 text-sm">No other rooms active</div>
        )}
      </div>
        </>
      )}
    </div>
  );
}