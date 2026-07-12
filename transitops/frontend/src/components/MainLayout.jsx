import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Shield,
  Menu,
  Fuel,
  DollarSign
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Maintenance Manager'] },
  { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Maintenance Manager'] },
  { name: 'Drivers', path: '/drivers', icon: Users, roles: ['Admin', 'Fleet Manager', 'Dispatcher'] },
  { name: 'Trips', path: '/trips', icon: Route, roles: ['Admin', 'Dispatcher'] },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Admin', 'Dispatcher', 'Maintenance Manager'] },
  { name: 'Fuel Logs', path: '/fuel', icon: Fuel, roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Maintenance Manager'] },
  { name: 'Expenses', path: '/expenses', icon: DollarSign, roles: ['Admin', 'Fleet Manager', 'Dispatcher'] },
  { name: 'Reports', path: '/reports', icon: FileText, roles: ['Admin', 'Fleet Manager', 'Maintenance Manager'] },
];

export default function MainLayout({ children, user, setUser, setIsAuthenticated }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUser({
      ...user,
      role: newRole,
      username: `${newRole.toLowerCase().replace(' ', '_')}_user`
    });
  };

  // Filter navigation items based on user's role
  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'Admin')
  );

  const getPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Kurachel';
  };

  return (
    <div className="flex h-screen bg-slate-55 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
          {!isCollapsed && (
            <div className="flex items-center gap-2 font-bold text-lg text-blue-400 tracking-wider">
              <Shield className="w-6 h-6 text-blue-500" />
              <span>KURA<span className="text-white">CHEL</span></span>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-blue-400 truncate">{user?.role || 'Admin'}</p>
              </div>
            )}
            {!isCollapsed && (
              <button 
                onClick={handleLogout}
                title="Sign Out"
                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 font-bold text-lg text-blue-400 tracking-wider">
            <Shield className="w-6 h-6 text-blue-500" />
            <span>KURA<span className="text-white">CHEL</span></span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-blue-400 truncate">{user?.role || 'Admin'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950 md:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Debugging Role Switcher */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-semibold text-blue-700 hidden sm:inline-block">Simulated Role:</label>
              <select
                value={user?.role || 'Admin'}
                onChange={handleRoleChange}
                className="bg-transparent text-xs font-bold text-blue-800 border-none outline-none cursor-pointer focus:ring-0"
              >
                <option value="Admin">Admin</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Maintenance Manager">Maintenance Manager</option>
              </select>
            </div>

            {/* Profile Dropdown Placeholder */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-700">{user?.username}</span>
                <span className="text-xs text-slate-400">{user?.email}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer">
                <User className="w-5 h-5" />
              </div>
              {/* Logout button (desktop helper) */}
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors hidden md:block"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
