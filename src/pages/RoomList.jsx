import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms/active");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch active rooms:", err);
      }
    };

    fetchRooms();
  }, []);

  const handleJoin = (roomId) => {
    navigate(`/watchroom/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Active Rooms</h1>

      {rooms.length === 0 ? (
        <p className="text-gray-600">No active rooms right now.</p>
      ) : (
        <div className="w-full max-w-xl space-y-4">
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{room.name}</h2>
                <p className="text-sm text-gray-500">
                  Users Online: {room.usersOnline}
                </p>
              </div>
              <button
                onClick={() => handleJoin(room.roomId)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
