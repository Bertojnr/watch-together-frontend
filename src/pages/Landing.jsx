import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4">
      <h1 className="text-5xl font-bold mb-6 text-center">Welcome to WatchTogether</h1>
      <p className="mb-8 text-lg text-center max-w-xl">
        Watch videos with friends in sync. Create private rooms, chat in real-time,
        and share your favorite moments together — wherever you are!
      </p>
      <div className="space-x-4">
        <Link
          to="/register"
          className="bg-white text-purple-700 px-6 py-3 rounded font-semibold hover:bg-purple-100"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="bg-white text-blue-700 px-6 py-3 rounded font-semibold hover:bg-blue-100"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
