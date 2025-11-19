import React, { useState, useEffect } from 'react';
import { db, initializeDatabase } from './services/db';
import { User, Patient, Consultation, ViewState, Role } from './types';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import PrescriptionPrint from './components/PrescriptionPrint';
import bcrypt from 'bcryptjs';
import {
  Users,
  Activity,
  FileText,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Search,
  Lock,
  User as UserIcon,
  Calculator,
  ArrowRightCircle,
  Clock,
  Scale,
  Pencil,
  Loader2,
  Baby,
  UserCheck,
  X,
  CalendarDays
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

// --- Funções Auxiliares ---
const getRoleLabel = (role: Role) => {
  switch (role) {
    case Role.Admin: return 'Administrador';
    case Role.Doctor: return 'Médico';
    case Role.Nurse: return 'Enfermeiro';
    case Role.Manager: return 'Gerente';
    default: return role;
  }
};

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

const getCreatableRoles = (currentRole: Role): Role[] => {
  switch (currentRole) {
    case Role.Admin:
    case Role.Manager:
      return [Role.Manager, Role.Doctor, Role.Nurse];
    case Role.Doctor:
      return [Role.Nurse];
    default:
      return [];
  }
};

const canEditUser = (actor: User, target: User): boolean => {
  if (actor.id === target.id) return true;
  if (actor.role === Role.Manager) return true; 
  if (actor.role === Role.Doctor) return target.role === Role.Nurse;
  return false;
};

const calculateDetailedAge = (birthDate: string) => {
  if (!birthDate) return { text: '', years: 0, daysTotal: 0 };
  
  const today = new Date();
  const birth = new Date(birthDate);
  const diffTime = Math.abs(today.getTime() - birth.getTime());
  const daysTotal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    text: `${years} Anos, ${months} Meses e ${days} Dias`,
    years,
    daysTotal
  };
};

const calculateBMI = (weight: number, height: number) => {
  if (!weight || !height) return '';
  const bmi = weight / (height * height);
  return bmi.toFixed(1);
};

// --- Subcomponentes para Páginas ---

// 1. Dashboard (Painel)
const Dashboard = ({ patients, consultations, setView }: { patients: Patient[], consultations: Consultation[], setView: (v: ViewState) => void }) => {
  const sifilisCases = consultations.filter(c => c.diagnosis.cid.startsWith('A50')).length;
  
  const chartData = [
    { name: 'Sífilis (A50)', value: sifilisCases, fill: '#ef4444' },
    { name: 'Outros', value: consultations.length - sifilisCases, fill: '#3b82f6' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Visão geral dos indicadores clínicos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Pacientes</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{patients.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-sm font-medium">Consultas Realizadas</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{consultations.length}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <FileText size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-slate-500 text-sm font-medium">Casos Confirmados (A50)</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{sifilisCases}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <Activity size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Distribuição de Casos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg text-white flex flex-col justify-center">
          <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setView('patients')}
              className="w-full bg-white/10 hover:bg-white/20 text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors backdrop-blur-sm"
            >
              <PlusCircle size={20} />
              <span>Cadastrar Novo Paciente</span>
            </button>
            <button 
              onClick={() => setView('consultation')}
              className="w-full bg-white/10 hover:bg-white/20 text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors backdrop-blur-sm"
            >
              <Activity size={20} />
              <span>Iniciar Nova Consulta</span>
            </button>
          </div>
          <div className="mt-8 text-blue-100 text-sm bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
             <p className="font-semibold flex items-center gap-2"><AlertTriangle size={14}/> Lembrete de Protocolo</p>
             <p className="mt-1 opacity-80">Para casos de sífilis congênita confirmados, inicie o tratamento com Penicilina G Benzatina imediatamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Lista de Pacientes
interface PatientsListProps {
    patients: Patient[];
    onRefresh: () => void | Promise<void>;
    onDelete: (id: string) => Promise<void>;
    currentUser: User;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}

const PatientsList = ({ patients, onRefresh, onDelete, currentUser, showToast }: PatientsListProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({ name: '', susNumber: '', birthDate: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManagePatients = true; 
  
  const handleAddNew = () => {
      setEditingPatient(null);
      setFormData({ name: '', susNumber: '', birthDate: '' });
      setShowModal(true);
  };

  const handleEdit = (e: React.MouseEvent, patient: Patient) => {
      e.stopPropagation();
      setEditingPatient(patient);
      setFormData({
          name: patient.name,
          susNumber: patient.susNumber,
          birthDate: patient.birthDate
      });
      setShowModal(true);
  };

  const handleTrashClick = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    
    setIsDeleting(true);
    try {
        await onDelete(patientToDelete.id);
        setDeleteModalOpen(false);
        setPatientToDelete(null);
        showToast('Paciente excluído com sucesso.');
    } catch (err) {
        console.error(err);
        showToast('Erro ao excluir paciente.', 'error');
    } finally {
        setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
        if (editingPatient) {
            await db.patients.update(editingPatient.id, {
                name: formData.name,
                susNumber: formData.susNumber,
                birthDate: formData.birthDate
            });
            showToast('Paciente atualizado com sucesso!');
        } else {
            await db.patients.add({
                id: `patient-${Date.now()}`,
                name: formData.name,
                susNumber: formData.susNumber,
                birthDate: formData.birthDate
            });
            showToast('Paciente cadastrado com sucesso!');
        }
        
        setFormData({ name: '', susNumber: '', birthDate: '' });
        setEditingPatient(null);
        setShowModal(false);
        await onRefresh();
    } catch (err) {
        console.error(err);
        showToast('Erro ao salvar paciente.', 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Pacientes</h2>
            <p className="text-slate-500">Gerenciamento de prontuários</p>
        </div>
        {canManagePatients && (
          <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <PlusCircle size={18} /> Novo Paciente
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cartão SUS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nascimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Idade</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {patients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.susNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(p.birthDate).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {Math.floor((new Date().getTime() - new Date(p.birthDate).getTime()) / 31557600000)} anos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canManagePatients && (
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={(e) => handleEdit(e, p)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
                                title="Editar Paciente"
                                type="button"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={(e) => handleTrashClick(e, p)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                                title="Excluir Paciente"
                                type="button"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Nenhum paciente cadastrado.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO/ADIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
                {editingPatient ? 'Editar Paciente' : 'Adicionar Paciente'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                    required 
                    type="text" 
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black" 
                    value={formData.name} 
                    onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, '');
                        setFormData({...formData, name: val});
                    }} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cartão SUS</label>
                <input 
                  required 
                  type="text" 
                  maxLength={15}
                  placeholder="000000000000000"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black" 
                  value={formData.susNumber} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, susNumber: val});
                  }} 
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{formData.susNumber.length}/15 dígitos</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                <div className="relative">
                  <input 
                    required 
                    type="date" 
                    max={getTodayString()}
                    style={{ colorScheme: 'light' }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black cursor-pointer" 
                    value={formData.birthDate} 
                    onChange={e => setFormData({...formData, birthDate: e.target.value})} 
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Datas futuras bloqueadas</p>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} disabled={isProcessing} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70">
                    {isProcessing && <Loader2 size={16} className="animate-spin"/>}
                    {editingPatient ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteModalOpen && patientToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border-t-4 border-red-500 animate-scale-in">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Paciente?</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        Tem certeza que deseja excluir o registro de <strong className="text-slate-800">{patientToDelete.name}</strong>? 
                        <br/><br/>
                        Esta ação é irreversível e removerá o paciente do banco de dados local.
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            {isDeleting ? <Loader2 size={18} className="animate-spin"/> : 'Sim, Excluir'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// 3. Gestão da Equipe (CORRIGIDO O DELAY)
const StaffList = ({ staff, currentUser, onRefresh, onDelete, showToast }: { staff: User[], currentUser: User, onRefresh: () => void, onDelete: (id: string) => Promise<void>, showToast: (msg: string, type?: 'success'|'error') => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    susNumber: '',
    role: Role.Nurse
  });

  const creatableRoles = getCreatableRoles(currentUser.role);

  useEffect(() => {
    if (showModal) {
      if (editingUser) {
        setFormData({
          name: editingUser.name,
          username: editingUser.username,
          password: '', 
          susNumber: editingUser.susNumber,
          role: editingUser.role
        });
      } else {
        setFormData({
          name: '',
          username: '',
          password: '',
          susNumber: '',
          role: creatableRoles[0] || Role.Nurse
        });
      }
    }
  }, [showModal, editingUser]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleTrashClick = (user: User) => {
    setStaffToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    setIsDeleting(true);
    try {
        await onDelete(staffToDelete.id);
        setDeleteModalOpen(false);
        setStaffToDelete(null);
        showToast('Membro excluído com sucesso.');
    } catch (err) {
        console.error(err);
        showToast('Erro ao excluir membro.', 'error');
    } finally {
        setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name) return;

    if (!editingUser && !formData.password) {
        showToast('Senha é obrigatória para novos usuários.', 'error');
        return;
    }

    if (formData.password) {
        const pwd = formData.password;
        const hasUpperCase = /[A-Z]/.test(pwd);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(pwd);
        const hasMinLength = pwd.length >= 6;

        if (!hasMinLength) {
            showToast('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }
        if (!hasUpperCase || !hasSpecial) {
            showToast('SENHA FRACA! Exige 1 Maiúscula e 1 Especial.', 'error');
            return;
        }
    }

    setIsProcessing(true); // Começa a carregar

    try {
        const existing = await db.users.where('username').equals(formData.username).first();
        if (existing && (!editingUser || existing.id !== editingUser.id)) {
            showToast('Este nome de usuário já está em uso.', 'error');
            setIsProcessing(false);
            return;
        }

        if (editingUser) {
            const updates: any = {
                name: formData.name,
                username: formData.username,
                susNumber: formData.susNumber,
                role: formData.role
            };

            // CRUCIAL: AWAIT BCRYPT.HASH (ASSÍNCRONO) - NÃO TRAVA
            if (formData.password) {
                updates.password = await bcrypt.hash(formData.password, 10);
            }

            await db.users.update(editingUser.id, updates);
            showToast('Dados atualizados com sucesso!');
        } else {
            // CRUCIAL: AWAIT BCRYPT.HASH (ASSÍNCRONO)
            const hashedPassword = await bcrypt.hash(formData.password, 10);
            await db.users.add({
                id: `user-${Date.now()}`,
                name: formData.name,
                username: formData.username,
                password: hashedPassword,
                susNumber: formData.susNumber,
                role: formData.role
            });
            showToast('Membro cadastrado com sucesso!');
        }

        setShowModal(false);
        setEditingUser(null);
        onRefresh();
    } catch (error) {
        console.error(error);
        showToast('Erro ao processar dados.', 'error');
    } finally {
        setIsProcessing(false); // Destrava
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Equipe Médica</h2>
          <p className="text-slate-500">Gestão de profissionais e acessos</p>
        </div>
        {creatableRoles.length > 0 && (
          <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <PlusCircle size={18} /> Adicionar Membro
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(s => {
          const isEditable = canEditUser(currentUser, s);
          const canDelete = currentUser.role === Role.Manager && s.role !== Role.Manager;

          return (
            <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow relative group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-inner shrink-0 ${
                s.role === Role.Manager ? 'bg-purple-500' : 
                s.role === Role.Doctor ? 'bg-blue-500' : 'bg-emerald-500'
                }`}>
                <span className="font-bold text-lg">{s.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-800 truncate pr-2">{s.name}</p>
                    <div className="flex gap-1 -mt-1 -mr-1">
                        {isEditable && (
                            <button 
                                onClick={() => handleEdit(s)}
                                className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                                title="Editar dados"
                            >
                                <Pencil size={16} />
                            </button>
                        )}
                        {canDelete && (
                             <button 
                                onClick={() => handleTrashClick(s)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                title="Excluir membro"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{getRoleLabel(s.role)}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-1.5 rounded border border-slate-100 w-fit">
                    <UserIcon size={10} /> 
                    <span className="truncate">{s.username}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">CNS: {s.susNumber}</p>
                </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE ADIÇÃO/EDIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
                {editingUser ? 'Editar Profissional' : 'Adicionar Profissional'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                    required 
                    type="text" 
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black" 
                    value={formData.name} 
                    onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, '');
                        setFormData({...formData, name: val});
                    }} 
                    placeholder="Ex: Dr. João Silva" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número CNS / SUS</label>
                <input 
                  required 
                  type="text" 
                  maxLength={15}
                  placeholder="000000000000000"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black" 
                  value={formData.susNumber} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, susNumber: val});
                  }} 
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{formData.susNumber.length}/15 dígitos</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuário de Acesso</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-3 text-slate-400"/>
                  <input required type="text" className="w-full border rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black" 
                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="usuario.login" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {editingUser ? 'Nova Senha (Opcional)' : 'Senha'}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-400"/>
                  <input 
                    type="password" 
                    required={!editingUser}
                    className="w-full border rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder={editingUser ? "Deixe em branco para manter" : "Mínimo 6 caracteres"} 
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                    Req: 1 Maiúscula, 1 Especial, min 6 chars.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as Role})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                  disabled={editingUser && editingUser.id === currentUser.id} 
                >
                  {editingUser && !creatableRoles.includes(editingUser.role) && (
                     <option value={editingUser.role}>{getRoleLabel(editingUser.role)}</option>
                  )}
                  {creatableRoles.map(r => (
                    <option key={r} value={r}>{getRoleLabel(r)}</option>
                  ))}
                </select>
                {editingUser && editingUser.id === currentUser.id && (
                    <p className="text-xs text-slate-400 mt-1">Você não pode alterar sua própria função.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} disabled={isProcessing} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50">
                    Cancelar
                </button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2">
                    {isProcessing && <Loader2 size={16} className="animate-spin" />}
                    {isProcessing ? 'Processando...' : (editingUser ? 'Salvar Alterações' : 'Cadastrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (EQUIPE) */}
       {deleteModalOpen && staffToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border-t-4 border-red-500 animate-scale-in">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Membro?</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        Tem certeza que deseja excluir o acesso de <strong className="text-slate-800">{staffToDelete.name}</strong>? 
                        <br/><br/>
                        Esta ação é irreversível e removerá o usuário do sistema.
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            {isDeleting ? <Loader2 size={18} className="animate-spin"/> : 'Sim, Excluir'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// 4. Consulta com Calculadora
const CreateConsultation = ({ patients, currentUser, onRefresh, setView, showToast }: { patients: Patient[], currentUser: User, onRefresh: () => Promise<void> | void, setView: (v: ViewState) => void, showToast: (msg: string, type?: 'success'|'error') => void }) => {
    const [patientId, setPatientId] = useState('');
    const [diagnosis, setDiagnosis] = useState({ cid: 'A50', description: 'Sífilis Congênita' });
    const [notes, setNotes] = useState('');
    const [medication, setMedication] = useState('Penicilina G Benzatina');
    const [dosage, setDosage] = useState('2.400.000 UI IM, dose única');

    // Abas: 'congenita' ou 'adquirida'
    const [protocolType, setProtocolType] = useState<'congenita' | 'adquirida'>('congenita');
    
    // Biometria Estrita (Obrigatória para ambos)
    const [biometrics, setBiometrics] = useState({
      weight: 0,
      height: 0
    });
    
    // Detalhes da Idade
    const [birthDate, setBirthDate] = useState('');
    const [ageDetails, setAgeDetails] = useState({ text: '', years: 0, daysTotal: 0 });

    // Estado Congênita
    const [calcData, setCalcData] = useState({
        cidPrincipal: 'A50.0',
        lcrAltered: false,
        clinicalSigns: false,
        maternalTxAdequate: false,
        evalNormal: true
    });

    // Estado Adquirida
    const [adultData, setAdultData] = useState({
        stage: 'recente', // recente | tardia | indeterminada
        isPregnant: false,
        allergy: false
    });

    const [calcResult, setCalcResult] = useState<any>(null);

    useEffect(() => {
        if (patientId) {
            const p = patients.find(pat => pat.id === patientId);
            if (p) {
                handleBirthDateChange(p.birthDate);
                const details = calculateDetailedAge(p.birthDate);
                if (details.years > 12) {
                    setProtocolType('adquirida');
                    setDiagnosis({ cid: 'A51', description: 'Sífilis Precoce' });
                } else {
                    setProtocolType('congenita');
                    setDiagnosis({ cid: 'A50', description: 'Sífilis Congênita' });
                }
            }
        }
    }, [patientId, patients]);

    const handleBirthDateChange = (dateStr: string) => {
        setBirthDate(dateStr);
        setAgeDetails(calculateDetailedAge(dateStr));
    };

    const executarCalculoProtocolo = () => {
        if (!biometrics.weight || !biometrics.height || !birthDate) {
          showToast('Preencha Peso, Altura e Data de Nascimento.', 'error');
          return;
        }

        let protocolId = '';
        let med = 'Penicilina G';
        let dosageText = '';
        let durationText = '';
        let warnings: string[] = [];
        let notesGen = '';
        let cidSuggested = '';

        if (protocolType === 'congenita') {
            const { cidPrincipal, lcrAltered, clinicalSigns, maternalTxAdequate, evalNormal } = calcData;
            const { daysTotal } = ageDetails;
            
            const doseUnit = 50000 * biometrics.weight;
            
            let type = '';
            let via = '';
            let freq = '';
            let duration = '';
            
            cidSuggested = cidPrincipal;

            if (cidPrincipal === 'A50.4' || lcrAltered) {
                protocolId = 'CRISTALINA_10D';
                type = 'Cristalina';
                via = 'IV';
                duration = '10 dias';
                freq = daysTotal <= 7 ? 'Q12h (a cada 12 horas)' : 'Q8h (a cada 8 horas)';
                durationText = '10 a 14 Dias (Uso Diário Hospitalar)';
                warnings.push('A frequência foi ajustada pela idade pós-natal para segurança terapêutica.');
                warnings.push('Monitoramento obrigatório: VDRL mensal no 1º ano.');
                notesGen = `Protocolo Neurosífilis/LCR Alterado. Dose calculada: ${doseUnit.toLocaleString('pt-BR')} UI/dose.`;
            } 
            else if (clinicalSigns || !evalNormal) {
                protocolId = 'PROCAINA_10D';
                type = 'Procaína';
                via = 'IM';
                duration = '10 dias';
                freq = 'Q24h (a cada 24 horas)';
                durationText = '10 a 14 Dias (Uso Diário Hospitalar)';
                warnings.push('ATENÇÃO: A interrupção do tratamento por > 24h exige reinício do ciclo.');
                notesGen = `Protocolo Sintomático/Avaliação Incompleta. Dose calculada: ${doseUnit.toLocaleString('pt-BR')} UI/dose.`;
            } 
            else if (!maternalTxAdequate) {
                protocolId = 'BENZATINA_DU';
                type = 'Benzatina';
                via = 'IM';
                duration = 'Dose Única';
                freq = 'Dose Única';
                durationText = 'Imediato (Dose Única)';
                if (doseUnit > 2400000) {
                     notesGen = `Dose ajustada para teto de 2.400.000 UI.`;
                } else {
                     notesGen = `Profilaxia (Mãe inadequada/Não tratada). Dose calculada: ${doseUnit.toLocaleString('pt-BR')} UI.`;
                }
            } 
            else {
                protocolId = 'DISPENSAR_TRATAMENTO';
                type = 'N/A';
            }

            if (protocolId === 'DISPENSAR_TRATAMENTO') {
                med = 'N/A - Seguimento';
                dosageText = 'Seguimento clínico apenas. VDRL 1, 3, 6, 12, 18 meses.';
                durationText = 'Seguimento Clínico';
            } else {
                med = `${med} ${type}`;
                dosageText = `${doseUnit.toLocaleString('pt-BR')} UI/kg/dose, ${via}, ${freq} por ${duration}`;
            }

        } else {
            const { stage, isPregnant, allergy } = adultData;
            cidSuggested = isPregnant ? 'O98.1' : (stage === 'recente' ? 'A51' : 'A52');

            if (allergy) {
                protocolId = 'ALERGIA';
                med = 'Alergia Confirmada';
                durationText = '15 a 30 dias (dependendo do estágio)';
                dosageText = isPregnant 
                    ? 'ENCAMINHAR PARA DESSENSIBILIZAÇÃO (Doxiciclina contraindicada)' 
                    : 'Doxiciclina 100mg, VO, 12/12h por 15 dias (ou 30 dias se tardia).';
                warnings.push('Paciente alérgico. Penicilina é a primeira escolha. Avaliar dessensibilização.');
                notesGen = 'Protocolo alternativo ou dessensibilização requerida.';
            } else {
                med = 'Penicilina G Benzatina';
                if (stage === 'recente') {
                    protocolId = 'ADQUIRIDA_RECENTE';
                    dosageText = '2.400.000 UI, IM, Dose Única (1.200.000 UI em cada glúteo).';
                    durationText = '1 Semana (Dose Única)';
                    notesGen = 'Sífilis Primária, Secundária ou Latente Recente (< 1 ano).';
                } else {
                    protocolId = 'ADQUIRIDA_TARDIA';
                    dosageText = '7.200.000 UI total. Esquema: 3 doses de 2.400.000 UI, IM, com intervalo de 1 semana.';
                    durationText = '3 Semanas (1 dose a cada 7 dias)';
                    notesGen = 'Sífilis Latente Tardia (> 1 ano), Terciária ou Indeterminada.';
                    warnings.push('O intervalo entre as doses não deve exceder 9 dias (idealmente 7 dias).');
                    warnings.push('Caso o intervalo ultrapasse 9 dias, o esquema deve ser reiniciado.');
                }
                warnings.push('Reação de Jarisch-Herxheimer pode ocorrer nas primeiras 24h.');
            }
            
            warnings.push('Notificação Compulsória: Preencher Ficha SINAN (Campo 40).');
            if (isPregnant) warnings.push('Tratamento do parceiro é essencial para evitar reinfecção.');
        }

        setCalcResult({
            protocolId,
            medication: med,
            dosageText: dosageText,
            durationText: durationText,
            warnings,
            notesGen,
            cidSuggested
        });
    };

    const applyProtocol = () => {
        if (!calcResult) return;
        
        setMedication(calcResult.medication);
        setDosage(calcResult.dosageText);
        setNotes(prev => {
            const base = prev ? prev + '\n\n' : '';
            const bio = `[Biometria] Peso: ${biometrics.weight}kg | Altura: ${biometrics.height}m | IMC: ${calculateBMI(biometrics.weight, biometrics.height)}\n`;
            const age = `[Idade] ${ageDetails.text}\n`;
            const gen = `[Protocolo Automático - ${protocolType === 'congenita' ? 'SC' : 'Adulto'}]\n` + calcResult.notesGen;
            const dur = `\nDuração Estimada: ${calcResult.durationText}`;
            const warn = calcResult.warnings.length > 0 ? '\nALERTAS:\n' + calcResult.warnings.join('\n') : '';
            return base + bio + age + gen + dur + warn;
        });
        setDiagnosis({ 
            cid: calcResult.cidSuggested, 
            description: protocolType === 'congenita' ? 'Sífilis Congênita' : 'Sífilis Adquirida' 
        });
        showToast('Protocolo aplicado ao formulário!');
    };

    const handleSave = async () => {
        if(!patientId) {
            showToast('Selecione um paciente.', 'error');
            return;
        }
        
        await db.consultations.add({
            id: `consult-${Date.now()}`,
            patientId,
            doctorId: currentUser.id,
            date: new Date().toISOString(),
            diagnosis,
            notes,
            prescription: { medication, dosage }
        });

        await onRefresh();
        showToast('Consulta registrada com sucesso!');
        setPatientId('');
        setNotes('');
        setView('dashboard');
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Nova Consulta</h2>
                <p className="text-slate-500">Registro clínico e prescrição</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: Calculadora */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-lg flex items-center gap-2">
                                <Calculator size={20} /> Calculadora PCDT
                            </h3>
                        </div>
                        
                        {/* Abas */}
                        <div className="flex bg-blue-800/50 p-1 rounded-lg mb-4">
                            <button 
                                onClick={() => setProtocolType('congenita')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                                    protocolType === 'congenita' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:text-white'
                                }`}
                            >
                                <Baby size={14} /> Congênita
                            </button>
                            <button 
                                onClick={() => setProtocolType('adquirida')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                                    protocolType === 'adquirida' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:text-white'
                                }`}
                            >
                                <UserCheck size={14} /> Adquirida
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* BIOMETRIA COMPARTILHADA */}
                            <div className="bg-blue-800/30 p-3 rounded-lg border border-blue-500/30">
                                <h4 className="text-xs font-bold text-blue-200 mb-2 uppercase flex items-center gap-1"><Scale size={12}/> Biometria & Identificação</h4>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <label className="block text-[10px] text-blue-200 mb-1">Peso (kg)</label>
                                        <input 
                                            type="number" step="0.1"
                                            value={biometrics.weight || ''}
                                            onChange={e => setBiometrics({...biometrics, weight: parseFloat(e.target.value)})}
                                            className="w-full rounded p-1.5 text-black bg-white outline-none font-medium text-sm"
                                            placeholder="0.0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-blue-200 mb-1">Altura (m)</label>
                                        <input 
                                            type="number" step="0.01"
                                            value={biometrics.height || ''}
                                            onChange={e => setBiometrics({...biometrics, height: parseFloat(e.target.value)})}
                                            className="w-full rounded p-1.5 text-black bg-white outline-none font-medium text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <div className="flex justify-between items-center bg-blue-900/50 px-2 py-1 rounded">
                                        <span className="text-[10px] text-blue-200">IMC Calculado:</span>
                                        <span className="text-sm font-bold text-white">
                                          {calculateBMI(biometrics.weight, biometrics.height) || '--'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-blue-200 mb-1">Data de Nascimento</label>
                                    <input 
                                            type="date"
                                            value={birthDate}
                                            max={getTodayString()}
                                            style={{ colorScheme: 'light' }}
                                            onChange={e => handleBirthDateChange(e.target.value)}
                                            className="w-full rounded p-1.5 text-black bg-white outline-none text-sm mb-1 cursor-pointer"
                                    />
                                    <div className="bg-blue-900/50 px-2 py-1.5 rounded text-center">
                                        <span className="text-xs font-bold text-white block">{ageDetails.text || 'Selecione a data'}</span>
                                    </div>
                                </div>
                            </div>

                            {protocolType === 'congenita' ? (
                                <>
                                    {/* INPUTS CONGÊNITA */}
                                    <div>
                                        <label className="block text-xs text-blue-200 mb-1">CID Principal</label>
                                        <select 
                                            value={calcData.cidPrincipal}
                                            onChange={e => setCalcData({...calcData, cidPrincipal: e.target.value})}
                                            className="w-full rounded p-2 text-black bg-white outline-none text-sm"
                                        >
                                            <option value="A50.0">A50.0 - Precoce</option>
                                            <option value="A50.4">A50.4 - Neurossífilis</option>
                                            <option value="A50.9">A50.9 - Não Esp.</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-blue-800/50 p-1 rounded">
                                            <input type="checkbox" checked={calcData.lcrAltered} onChange={e => setCalcData({...calcData, lcrAltered: e.target.checked})} className="w-4 h-4 accent-blue-500 bg-white" />
                                            <span>LCR Alterado / VDRL Reagente</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-blue-800/50 p-1 rounded">
                                            <input type="checkbox" checked={calcData.clinicalSigns} onChange={e => setCalcData({...calcData, clinicalSigns: e.target.checked})} className="w-4 h-4 accent-blue-500 bg-white" />
                                            <span>Sinais Clínicos Presentes</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-blue-800/50 p-1 rounded">
                                            <input type="checkbox" checked={calcData.maternalTxAdequate} onChange={e => setCalcData({...calcData, maternalTxAdequate: e.target.checked})} className="w-4 h-4 accent-blue-500 bg-white" />
                                            <span>Tratamento Materno Adequado</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-blue-800/50 p-1 rounded">
                                            <input type="checkbox" checked={calcData.evalNormal} onChange={e => setCalcData({...calcData, evalNormal: e.target.checked})} className="w-4 h-4 accent-blue-500 bg-white" />
                                            <span>Avaliação Neonatal Normal</span>
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* INPUTS ADQUIRIDA */}
                                    <div>
                                        <label className="block text-xs text-blue-200 mb-1">Estágio Clínico</label>
                                        <select 
                                            value={adultData.stage}
                                            onChange={e => setAdultData({...adultData, stage: e.target.value})}
                                            className="w-full rounded p-2 text-black bg-white outline-none text-sm font-medium"
                                        >
                                            <option value="recente">Recente (Primária/Secundária/Latente &lt; 1 ano)</option>
                                            <option value="tardia">Tardia (Latente &gt; 1 ano/Terciária/Indet.)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-blue-800/50 p-2 rounded transition-colors">
                                            <input type="checkbox" checked={adultData.isPregnant} onChange={e => setAdultData({...adultData, isPregnant: e.target.checked})} className="w-5 h-5 accent-pink-500 bg-white" />
                                            <span className={adultData.isPregnant ? 'text-pink-300 font-bold' : 'text-white'}>Paciente Gestante</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-blue-800/50 p-2 rounded transition-colors border border-transparent hover:border-red-400/30">
                                            <input type="checkbox" checked={adultData.allergy} onChange={e => setAdultData({...adultData, allergy: e.target.checked})} className="w-5 h-5 accent-red-500 bg-white" />
                                            <span className={adultData.allergy ? 'text-red-300 font-bold' : 'text-white'}>Alergia à Penicilina</span>
                                        </label>
                                    </div>
                                    <div className="bg-blue-800/30 p-3 rounded text-xs text-blue-200 mt-4">
                                            <p><strong>Nota:</strong> Para Sífilis Adquirida, a dose padrão de Benzatina é 2.400.000 UI por aplicação.</p>
                                    </div>
                                </>
                            )}

                            <button 
                                onClick={executarCalculoProtocolo}
                                className="w-full bg-blue-500 hover:bg-blue-400 text-white py-2 rounded-lg font-bold mt-4 transition-colors shadow-sm border-b-4 border-blue-600 active:border-b-0 active:translate-y-1"
                            >
                                Calcular Protocolo
                            </button>
                        </div>
                    </div>

                    {calcResult && (
                        <div className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide">Resultado Sugerido</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    protocolType === 'congenita' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                                }`}>
                                    {protocolType === 'congenita' ? 'PEDIATRIA' : 'ADULTO'}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                    <span className="text-xs text-slate-500 block">Medicamento</span>
                                    <span className={`font-bold ${calcResult.protocolId === 'ALERGIA' ? 'text-red-600' : 'text-slate-900'}`}>
                                        {calcResult.medication}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                    <span className="text-xs text-slate-500 block">Posologia / Esquema</span>
                                    <span className="font-medium text-slate-900 text-sm leading-tight block mt-1">
                                        {calcResult.dosageText}
                                    </span>
                                </div>
                                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                    <span className="text-xs text-blue-700 block font-bold flex items-center gap-1"><CalendarDays size={12}/> Duração Estimada</span>
                                    <span className="font-bold text-blue-900 text-sm block mt-1">
                                        {calcResult.durationText}
                                    </span>
                                </div>
                                {calcResult.warnings.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 p-2 rounded">
                                        <span className="text-xs font-bold text-amber-800 block flex items-center gap-1"><AlertTriangle size={12}/> Alertas</span>
                                        <ul className="list-disc pl-4 mt-1 text-[10px] text-amber-800 space-y-0.5">
                                            {calcResult.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={applyProtocol}
                                className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <ArrowRightCircle size={16} /> Aplicar na Consulta
                            </button>
                        </div>
                    )}
                </div>

                {/* Coluna Direita: Formulário */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 pb-2 border-b">
                            <FileText size={20} /> Dados da Consulta
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar Paciente</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <select 
                                        value={patientId} 
                                        onChange={(e) => setPatientId(e.target.value)}
                                        className="w-full border rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black appearance-none"
                                    >
                                        <option value="">-- Busque um paciente --</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - SUS: {p.susNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CID</label>
                                    <input 
                                        type="text"
                                        value={diagnosis.cid}
                                        onChange={e => setDiagnosis({...diagnosis, cid: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Diagnóstica</label>
                                    <input 
                                        type="text"
                                        value={diagnosis.description}
                                        onChange={e => setDiagnosis({...diagnosis, description: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Medicamento</label>
                                <select 
                                    value={medication}
                                    onChange={e => setMedication(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                                >
                                    <option value="Penicilina G Benzatina">Penicilina G Benzatina</option>
                                    <option value="Penicilina G Procaína">Penicilina G Procaína</option>
                                    <option value="Penicilina G Cristalina">Penicilina G Cristalina</option>
                                    <option value="Doxiciclina">Doxiciclina</option>
                                    <option value="Ceftriaxona">Ceftriaxona</option>
                                    <option value="Azitromicina">Azitromicina</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dosagem e Posologia</label>
                                <textarea 
                                    rows={2}
                                    value={dosage}
                                    onChange={e => setDosage(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Observações Clínicas / Anamnese</label>
                                <textarea 
                                    rows={4}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Descreva a evolução, sinais vitais e detalhes relevantes..."
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    onClick={handleSave}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2 transition-all transform active:scale-95"
                                >
                                    <CheckCircle size={20} />
                                    Registrar Consulta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PrescriptionListPage = ({ consultations, patients, staff, onViewPrescription }: any) => {
    const enrichedConsultations = consultations.map((c: Consultation) => ({
      ...c,
      patientName: patients.find((p: Patient) => p.id === c.patientId)?.name || 'Desconhecido',
      doctorName: staff.find((s: User) => s.id === c.doctorId)?.name || 'Desconhecido'
    }));

    return (
      <div className="p-8 max-w-7xl mx-auto">
         <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Histórico de Prescrições</h2>
            <p className="text-slate-500">Visualize e imprima receitas médicas</p>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Médico</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Diagnóstico</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                  {enrichedConsultations.map((c: any) => (
                     <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.patientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.doctorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(c.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.diagnosis.cid}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <button 
                              onClick={() => onViewPrescription(c.id)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors font-semibold text-xs"
                           >
                              Visualizar PDF
                           </button>
                        </td>
                     </tr>
                  ))}
                  {enrichedConsultations.length === 0 && (
                      <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nenhuma prescrição registrada.</td>
                      </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    );
};

const ProtocolsPage = () => {
    return (
      <div className="p-8 max-w-4xl mx-auto">
         <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Protocolos Clínicos</h2>
            <p className="text-slate-500">Diretrizes do Ministério da Saúde (PCDT 2022)</p>
         </div>

         <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
                 <h3 className="font-bold text-blue-900 text-lg mb-2">Sífilis Congênita (A50)</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">
                     Infecção disseminada pelo Treponema pallidum transmitida da mãe para o feto via transplacentária.
                     O tratamento da mãe deve ser feito com Penicilina G Benzatina.
                 </p>
                 <div className="mt-4 bg-slate-50 p-4 rounded-lg">
                     <p className="text-sm font-semibold text-slate-800">Critérios de Tratamento do Neonato:</p>
                     <ul className="list-disc pl-5 mt-2 text-sm text-slate-600 space-y-1">
                         <li><strong>Neurosífilis / LCR Alterado:</strong> Penicilina Cristalina IV, 10 dias.</li>
                         <li><strong>Sinais Clínicos / Liquor Normal:</strong> Penicilina Procaína IM, 10 dias.</li>
                         <li><strong>Assintomático / Mãe Inadequada:</strong> Penicilina Benzatina IM, Dose Única.</li>
                     </ul>
                 </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600">
                 <h3 className="font-bold text-teal-900 text-lg mb-2">Sífilis Adquirida (Adulto)</h3>
                 <div className="mt-4 bg-slate-50 p-4 rounded-lg">
                     <p className="text-sm font-semibold text-slate-800">Esquemas Terapêuticos:</p>
                     <ul className="list-disc pl-5 mt-2 text-sm text-slate-600 space-y-1">
                         <li><strong>Primária/Secundária/Latente Recente:</strong> Penicilina G Benzatina 2.400.000 UI, IM, Dose Única.</li>
                         <li><strong>Latente Tardia/Terciária:</strong> Penicilina G Benzatina 2.400.000 UI, IM, semanal por 3 semanas (Total 7.200.000 UI).</li>
                         <li><strong>Neurossífilis:</strong> Penicilina G Cristalina 18-24 milhões UI/dia, IV, por 14 dias.</li>
                     </ul>
                 </div>
             </div>
         </div>
      </div>
    );
};

const SettingsPage = ({ onReset, showToast }: { onReset: () => void, showToast: (msg: string, type?: 'success'|'error') => void }) => {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (window.confirm('ATENÇÃO: Isso apagará TODOS os dados (Pacientes, Consultas, Usuários) e restaurará apenas o Gerente padrão. Deseja continuar?')) {
            setLoading(true);
            await db.patients.clear();
            await db.consultations.clear();
            const users = await db.users.toArray();
            for (const u of users) {
                if (u.id !== 'user-manager-initial') {
                    await db.users.delete(u.id);
                }
            }
            await onReset();
            setLoading(false);
            showToast('Sistema resetado com sucesso.', 'error');
        }
    };

    return (
      <div className="p-8 max-w-2xl mx-auto h-full flex flex-col">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Configurações</h2>
        <p className="text-slate-500 mb-8">Manutenção do sistema</p>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Zona de Perigo</h3>
            <p className="text-sm text-slate-600 mb-6">
                A ação abaixo remove permanentemente todos os registros do banco de dados local deste navegador. Use com cautela.
            </p>
            <button 
                onClick={handleReset}
                disabled={loading}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-semibold border border-red-200 transition-colors w-full sm:w-auto"
            >
                {loading ? 'Resetando...' : 'Resetar Banco de Dados'}
            </button>
        </div>
        
        {/* RODAPÉ COM DEDICAÇÃO */}
        <div className="mt-auto pt-12 pb-4 text-center space-y-3">
            <p className="text-[10px] text-slate-300 uppercase tracking-widest">
                ProAcolhe CSC v1.2.0 | Build 2025.11.18
            </p>
            <div className="inline-block px-4 py-2 bg-pink-50 rounded-full border border-pink-100 shadow-sm">
                <p className="text-xs text-pink-600 italic font-medium flex items-center gap-1">
                    Para minha amada Karen, que dá todo suporte no projeto e na vida. ❤️
                </p>
            </div>
        </div>
      </div>
    );
};

// --- COMPONENTE PRINCIPAL DO APP ---

function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [viewingPrescriptionId, setViewingPrescriptionId] = useState<string | null>(null);

  // --- ESTADO DO TOAST (NOTIFICAÇÃO FLUTUANTE) ---
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000); // Some em 3 segundos
  };

  // Carregamento Inicial de Dados
  const loadData = async () => {
    try {
      const [p, s, c] = await Promise.all([
          db.patients.toArray(),
          db.users.toArray(),
          db.consultations.toArray()
      ]);
      setPatients(p);
      setStaff(s);
      setConsultations(c);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      await loadData();
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  const handleRefresh = async () => {
      await loadData();
  };

  // Exclusão Otimista para Pacientes
  const handleDeletePatient = async (id: string) => {
      setPatients(prev => prev.filter(p => p.id !== id));
      await db.patients.delete(id);
      await loadData(); 
  };

  // Exclusão Otimista para Equipe
  const handleDeleteStaff = async (id: string) => {
      setStaff(prev => prev.filter(s => s.id !== id));
      await db.users.delete(id);
      await loadData();
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 gap-2">
            <Loader2 className="animate-spin" /> Carregando ProAcolhe...
        </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Modo de Visualização de Prescrição (Sobreposição)
  if (viewingPrescriptionId) {
      const consultation = consultations.find(c => c.id === viewingPrescriptionId);
      const patient = patients.find(p => p.id === consultation?.patientId);
      const doctor = staff.find(u => u.id === consultation?.doctorId);
      
      if (consultation && patient && doctor) {
          return (
              <PrescriptionPrint 
                  consultation={consultation} 
                  patient={patient} 
                  doctor={doctor} 
                  onClose={() => setViewingPrescriptionId(null)} 
              />
          );
      }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        user={currentUser} 
        onLogout={handleLogout} 
      />
      
      <div className="flex-1 overflow-y-auto relative">
        {activeView === 'dashboard' && (
            <Dashboard patients={patients} consultations={consultations} setView={setActiveView} />
        )}
        {activeView === 'patients' && (
            <PatientsList 
                patients={patients} 
                onRefresh={handleRefresh} 
                onDelete={handleDeletePatient}
                currentUser={currentUser}
                showToast={showToast} // Passando a função de notificação
            />
        )}
        {activeView === 'staff' && (
            <StaffList 
                staff={staff} 
                currentUser={currentUser} 
                onRefresh={handleRefresh} 
                onDelete={handleDeleteStaff}
                showToast={showToast} // Passando a função de notificação
            />
        )}
        {activeView === 'consultation' && (
            <CreateConsultation 
                patients={patients} 
                currentUser={currentUser} 
                onRefresh={handleRefresh} 
                setView={setActiveView}
                showToast={showToast} // Passando a função de notificação
            />
        )}
        {activeView === 'prescriptions' && (
            <PrescriptionListPage 
                consultations={consultations} 
                patients={patients} 
                staff={staff} 
                onViewPrescription={setViewingPrescriptionId}
            />
        )}
        {activeView === 'protocols' && <ProtocolsPage />}
        {activeView === 'settings' && <SettingsPage onReset={handleRefresh} showToast={showToast} />}

        {/* --- NOTIFICAÇÃO FLUTUANTE (TOAST) --- */}
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-lg shadow-2xl border-l-4 animate-fade-in flex items-center gap-3 ${
                notification.type === 'success' 
                ? 'bg-white border-green-500 text-slate-800' 
                : 'bg-white border-red-500 text-slate-800'
            }`}>
                <div className={`${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                    <p className="font-bold text-sm">{notification.type === 'success' ? 'Sucesso' : 'Atenção'}</p>
                    <p className="text-sm opacity-90">{notification.msg}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;