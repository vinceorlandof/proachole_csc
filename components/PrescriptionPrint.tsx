import React from 'react';
import { Consultation, Patient, User, Role } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrescriptionPrintProps {
  consultation: Consultation;
  patient: Patient;
  doctor: User;
  onClose: () => void;
}

const PrescriptionPrint: React.FC<PrescriptionPrintProps> = ({ consultation, patient, doctor, onClose }) => {
  
  const handlePrint = () => {
    window.print();
  };

  // Helper para formatar cargo
  const getDoctorRoleLabel = (role: Role) => {
     if (role === Role.Doctor) return 'Médico(a)';
     if (role === Role.Nurse) return 'Enfermeiro(a)';
     return 'Profissional de Saúde';
  };

  return (
    <div className="fixed inset-0 bg-gray-800/50 z-50 overflow-y-auto flex justify-center items-start pt-8 print:p-0 print:bg-white print:absolute print:inset-0 print:block">
      
      {/* --- ESTILOS GLOBAIS DE IMPRESSÃO (O SEGREDO) --- */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          #prescription-content, #prescription-content * { visibility: visible; }
          #prescription-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 15mm; /* Margem de segurança da impressora */
            background: white;
            border: none;
            box-shadow: none;
          }
          /* Esconde botões na impressão */
          .no-print { display: none !important; }
        }
      `}</style>

      {/* BARRA DE CONTROLE (Topo) */}
      <div className="fixed top-4 right-4 flex gap-3 no-print z-50">
         <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-100 transition-colors font-bold"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors font-bold"
          >
            <Printer size={18} />
            Imprimir
          </button>
      </div>

      {/* --- FOLHA A4 (CONTEÚDO) --- */}
      <div 
        id="prescription-content"
        className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl text-slate-900 font-sans relative flex flex-col"
      >
          {/* Header */}
          <header className="text-center border-b-2 border-slate-800 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 uppercase">Dr./Dra. {doctor.name}</h2>
            <p className="text-slate-500 text-sm uppercase tracking-wider font-bold mt-1">
              {getDoctorRoleLabel(doctor.role)}
            </p>
            <p className="text-slate-400 text-xs mt-1 font-mono">CNS/CNES: {doctor.susNumber}</p>
          </header>

          {/* Subheader (Local) */}
          <div className="flex justify-between items-end border-b border-slate-200 pb-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">UBS "Comunidade Viva"</h3>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Sistema Único de Saúde (SUS)</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase mb-1">Emissão</p>
              <p className="font-bold text-slate-900 text-lg">{new Date(consultation.date).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Corpo Principal (Expande para empurrar o rodapé) */}
          <main className="flex-1 flex flex-col gap-8">
            
            {/* Identificação do Paciente */}
            <section className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 border-b border-blue-200 pb-1">Identificação do Paciente</h4>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <p className="text-[10px] text-slate-500 uppercase">Nome Completo</p>
                  <p className="font-bold text-slate-900 text-lg truncate">{patient.name}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-500 uppercase">Nascimento</p>
                  <p className="font-medium text-slate-900">{new Date(patient.birthDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-slate-500 uppercase">Cartão SUS</p>
                  <p className="font-mono text-slate-900 text-sm">{patient.susNumber}</p>
                </div>
              </div>
            </section>

            {/* Diagnóstico */}
            <section>
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                 <h4 className="text-sm font-bold text-slate-900 uppercase">Hipótese Diagnóstica</h4>
               </div>
               <div className="pl-3">
                 <p className="text-lg text-slate-800 font-medium">
                    <span className="font-bold">{consultation.diagnosis.cid}</span> • {consultation.diagnosis.description}
                 </p>
                 {consultation.notes && (
                   <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic whitespace-pre-line">
                     <span className="font-bold not-italic text-xs text-slate-400 block mb-1">OBSERVAÇÕES CLÍNICAS:</span>
                     {consultation.notes}
                   </div>
                 )}
               </div>
            </section>

            {/* Prescrição */}
            <section className="mt-2">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                 <h4 className="text-sm font-bold text-slate-900 uppercase">Prescrição Medicamentosa</h4>
               </div>
               
               <div className="border border-slate-300 rounded-lg p-6 relative">
                  {/* Marcador numérico estilizado */}
                  <div className="absolute -left-3 top-6 bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">1</div>
                  
                  <p className="text-xl font-bold text-slate-900 mb-3 pl-2">{consultation.prescription.medication}</p>
                  
                  <div className="bg-slate-100 p-4 rounded-md ml-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Posologia / Modo de Uso</p>
                    <p className="text-base font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                       {consultation.prescription.dosage}
                    </p>
                  </div>
               </div>
               <p className="text-[10px] text-slate-400 mt-2 text-center italic">* Seguir rigorosamente o protocolo PCDT de Sífilis Congênita *</p>
            </section>

          </main>

          {/* Footer / Assinatura (Fica sempre no final graças ao flex-1 do main) */}
          <footer className="mt-12 pt-8 border-t border-dashed border-slate-300">
            <div className="grid grid-cols-2 gap-12 items-end">
              
              {/* Assinatura */}
              <div className="text-center">
                <div className="h-px bg-slate-900 w-3/4 mx-auto mb-3"></div>
                <p className="font-bold text-slate-900 text-sm uppercase">Dr./Dra. {doctor.name}</p>
                <p className="text-slate-500 text-[10px] uppercase">Assinatura e Carimbo</p>
              </div>

              {/* Data Local */}
              <div className="text-right">
                 <p className="text-slate-500 text-xs">Local e Data:</p>
                 <p className="text-slate-900 font-bold">Ribeirão Pires - SP</p>
                 <p className="text-slate-700 text-sm">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-[9px] text-slate-300 font-mono">Documento gerado digitalmente via Sistema ProAcolhe - CSC v1.0</p>
            </div>
          </footer>
      </div>
    </div>
  );
};

export default PrescriptionPrint;