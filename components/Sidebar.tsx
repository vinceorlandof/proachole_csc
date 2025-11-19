import React from 'react';
import { ViewState, User, Role } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  Pill, 
  BookOpen, 
  Settings, 
  LogOut,
  UserCircle
} from 'lucide-react';

interface SidebarProps {
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, user, onLogout }) => {
  const menuItems: { id: ViewState; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'staff', label: 'Equipe', icon: UserCircle },
    { id: 'consultation', label: 'Consulta', icon: Stethoscope },
    { id: 'prescriptions', label: 'Prescrições', icon: Pill },
    { id: 'protocols', label: 'Protocolos', icon: BookOpen },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.Admin: return 'Administrador';
      case Role.Doctor: return 'Médico';
      case Role.Nurse: return 'Enfermeiro';
      case Role.Manager: return 'Gerente';
      default: return role;
    }
  };

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col h-screen shadow-xl transition-all duration-300 no-print">
      <div className="p-6 border-b border-blue-700/50">
        <h1 className="text-lg font-bold tracking-wide flex items-center gap-2">
          <span className="bg-white text-blue-900 p-1 rounded text-xs font-extrabold">CSC</span>
          ProAcolhe
        </h1>
        <p className="text-blue-200 text-xs mt-1">Apoio à Decisão Clínica</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeView === item.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-blue-100 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={18} className={activeView === item.id ? 'text-blue-300' : 'text-blue-300/70'} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-blue-700/50 bg-blue-900/50">
        <div className="flex items-center gap-3 mb-4 bg-blue-800/50 p-3 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-xs text-blue-300 truncate">{getRoleLabel(user.role)}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm"
        >
          <LogOut size={16} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Sidebar;