import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        WatchTogether
      </Link>
      <nav className="space-x-4">
        {user ? (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="bg-red-600 px-4 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
