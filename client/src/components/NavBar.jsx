// client/src/components/NavBar.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function NavBar(){
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={()=>navigate('/dashboard')} className="flex items-center gap-3 focus:outline-none">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm">PT</div>
            <div className="hidden sm:block">
              <div className="text-lg font-semibold">PT Portal</div>
            </div>
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm hover:underline">Dashboard</Link>
          <Link to="/students" className="text-sm hover:underline">Students</Link>
          <Link to="/messages" className="text-sm hover:underline">Messages</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-sm text-slate-300">{user?.name}</div>
          <button onClick={()=>{ logout(); navigate('/'); }} className="bg-white/6 text-white px-3 py-1 rounded-md border border-white/6 hover:bg-white/10">Logout</button>

          {/* mobile menu button */}
          <button onClick={()=>setOpen(o=>!o)} className="md:hidden px-2 py-2 rounded bg-white/6">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>
      

      {open && (
        <div className="md:hidden bg-white/3 border-t border-white/6">
          <div className="px-4 py-3 flex flex-col gap-2">
            <Link to="/dashboard" className="px-2 py-2">Dashboard</Link>
            <Link to="/students" className="px-2 py-2">Students</Link>
            <Link to="/messages" className="px-2 py-2">Messages</Link>
            <button onClick={()=>{ setOpen(false); logout(); navigate('/'); }} className="px-2 py-2 text-left">Logout</button>
          </div>
        </div>
      )}
    </header>
  );
}
