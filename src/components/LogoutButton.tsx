import { useAuth } from "../context/useAuth";

const LogoutButton = () => {
  const { logout, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <button
      onClick={logout}
      className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
