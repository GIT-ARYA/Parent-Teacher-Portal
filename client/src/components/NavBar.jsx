import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const homeRoute =
    user.role === 'parent' ? '/parent-dashboard' : '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      {/* PT */}
      <button
        onClick={() => navigate(homeRoute)}
        className="px-4 py-2 rounded-md bg-black text-white font-semibold"
      >
        PT
      </button>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-md bg-black text-white text-sm font-semibold"
      >
        Logout
      </button>
    </nav>
  );
}
