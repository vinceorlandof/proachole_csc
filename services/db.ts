
import Dexie, { Table } from 'dexie';
import { User, Patient, Consultation, Role } from '../types';
import bcrypt from 'bcryptjs';

class ProAcolheDB extends Dexie {
  users!: Table<User>;
  patients!: Table<Patient>;
  consultations!: Table<Consultation>;

  constructor() {
    super('ProAcolheDB');
    (this as any).version(1).stores({
      users: 'id, username, name, susNumber, role',
      patients: 'id, name, susNumber, birthDate',
      consultations: 'id, patientId, doctorId, date'
    });
  }
}

export const db = new ProAcolheDB();

export const initializeDatabase = async () => {
  const userCount = await db.users.count();
  
  if (userCount === 0) {
    // Criar usuário gerente inicial
    const hashedPassword = bcrypt.hashSync('ProAcolhe2025!', 10);
    await db.users.add({
      id: 'user-manager-initial',
      name: 'Gerente do Sistema',
      susNumber: '000000000000000', // 15 dígitos
      role: Role.Manager,
      username: 'gerente',
      password: hashedPassword
    });
    console.log('✅ Gerente padrão criado com sucesso.');
  }
};