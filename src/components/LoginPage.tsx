import React, { useState } from 'react';
import { AuthUser, PatientData, UserRole } from '../types';
import { DOCTOR_AVATAR, SAMPLE_PATIENTS } from '../data/clinicalData';
import { 
  Stethoscope, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Dna, 
  Lock, 
  CheckCircle2, 
  Hospital, 
  Sparkles,
  FlaskConical
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser, selectedPatient?: PatientData) => void;
  onOpenModelTesting: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onOpenModelTesting }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPatientIndex, setSelectedPatientIndex] = useState<number>(0);
  const [licenseNumber, setLicenseNumber] = useState('NPI-94827104');
  const [rememberMe, setRememberMe] = useState(true);

  // Preset Doctor Accounts
  const doctorAccounts: AuthUser[] = [
    {
      role: 'doctor',
      name: 'Dr. Julian Vance, MD, FACC',
      title: 'Chief of Cardiovascular Genomics',
      email: 'j.vance@biopulse-genomics.org',
      hospital: 'BioPulse Heart & Genomic Institute',
      avatarUrl: DOCTOR_AVATAR,
      npiNumber: 'NPI-94827104',
    },
    {
      role: 'doctor',
      name: 'Dr. Sarah Lin, MD, PhD',
      title: 'Clinical Molecular Geneticist',
      email: 's.lin@biopulse-genomics.org',
      hospital: 'Center for Preventive Cardiometabolics',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813583-09419b4a45ec?w=150&auto=format&fit=crop&q=80',
      npiNumber: 'NPI-81029384',
    },
  ];

  const handleQuickDoctorLogin = (doc: AuthUser) => {
    onLogin(doc, SAMPLE_PATIENTS[0]);
  };

  const handleQuickPatientLogin = (patient: PatientData) => {
    const patientUser: AuthUser = {
      role: 'patient',
      name: patient.name,
      title: `Patient (${patient.id})`,
      email: `${patient.name.toLowerCase().replace(' ', '.')}@myhealth-portal.com`,
      patientId: patient.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    onLogin(patientUser, patient);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'doctor') {
      const doc = doctorAccounts[0];
      onLogin(
        {
          ...doc,
          email: email || doc.email,
        },
        SAMPLE_PATIENTS[0]
      );
    } else {
      const pt = SAMPLE_PATIENTS[selectedPatientIndex] || SAMPLE_PATIENTS[0];
      handleQuickPatientLogin(pt);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEFEE] text-[#41403C] flex flex-col justify-between selection:bg-[#F1DDD0] selection:text-[#8A4A1C] font-['Roboto',sans-serif] relative overflow-x-hidden">
      {/* Top Navigation / Brand Header */}
      <header className="w-full border-b border-[#D4D8D5] bg-white/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#41403C] flex items-center justify-center text-white shadow-2xs">
            <Dna className="w-5 h-5 text-[#D08856]" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-[#41403C] flex items-center gap-2">
              BioPulse Genomics™
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF2EB] text-[#A65B27] border border-[#EACAB2]">
                v4.2 PRO
              </span>
            </div>
            <p className="text-xs text-[#6F6D68]">Precision Cardiometabolic &amp; Pharmacogenomics Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6F6D68]">
          <span className="hidden sm:flex items-center gap-1.5 bg-[#EDEFEE] px-3 py-1.5 rounded-full border border-[#D4D8D5]">
            <ShieldCheck className="w-4 h-4 text-[#AA210F]" />
            <span>HIPAA Compliant &amp; SOC2 Type II Certified</span>
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-4xl bg-white border border-[#D4D8D5] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Portal Selector Category Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-[#D4D8D5] bg-[#EDEFEE]">
            <button
              type="button"
              onClick={() => setSelectedRole('doctor')}
              className={`py-4 px-4 sm:px-6 flex items-center justify-center gap-3 transition-all relative cursor-pointer ${
                selectedRole === 'doctor'
                  ? 'bg-white text-[#41403C] font-bold shadow-2xs'
                  : 'text-[#6F6D68] hover:text-[#41403C] hover:bg-[#E2E6E4]'
              }`}
            >
              <div className={`p-2 rounded-xl ${selectedRole === 'doctor' ? 'bg-[#AA210F] text-white' : 'bg-[#D4D8D5] text-[#41403C]'}`}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-bold leading-tight text-[#41403C]">
                  Doctor / Clinician Portal
                </span>
                <span className="text-[11px] font-normal text-[#6F6D68] block">
                  Physicians, Geneticists &amp; Care Leads
                </span>
              </div>
              {selectedRole === 'doctor' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#AA210F]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className={`py-4 px-4 sm:px-6 flex items-center justify-center gap-3 transition-all relative cursor-pointer ${
                selectedRole === 'patient'
                  ? 'bg-white text-[#41403C] font-bold shadow-2xs'
                  : 'text-[#6F6D68] hover:text-[#41403C] hover:bg-[#E2E6E4]'
              }`}
            >
              <div className={`p-2 rounded-xl ${selectedRole === 'patient' ? 'bg-[#D08856] text-white' : 'bg-[#D4D8D5] text-[#41403C]'}`}>
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-bold leading-tight text-[#41403C]">
                  Patient &amp; Family Portal
                </span>
                <span className="text-[11px] font-normal text-[#6F6D68] block">
                  Genomic Reports &amp; Drug Testing
                </span>
              </div>
              {selectedRole === 'patient' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D08856]" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenModelTesting}
              className="py-4 px-4 sm:px-6 flex items-center justify-center gap-3 transition-all relative cursor-pointer text-[#6F6D68] hover:text-[#41403C] hover:bg-white"
            >
              <div className="p-2 rounded-xl bg-[#D4D8D5] text-[#41403C]">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-bold leading-tight text-[#41403C]">
                  ML Model Testing
                </span>
                <span className="text-[11px] font-normal text-[#6F6D68] block">
                  Predictions &amp; AI Interpretation
                </span>
              </div>
            </button>
          </div>

          {/* Portal Content Area */}
          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
            {/* Left Column: Form & Quick Demo Logins */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF2EB] text-[#A65B27] border border-[#EACAB2]">
                      {selectedRole === 'doctor' ? 'Clinical Gateway' : 'Personal Health Access'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#41403C]">
                    {selectedRole === 'doctor'
                      ? 'Clinician Authentication'
                      : 'Patient Health Portal Sign In'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6F6D68] mt-1">
                    {selectedRole === 'doctor'
                      ? 'Secure sign-in for authorized medical personnel to access PRS calculators, ordering, and reports.'
                      : 'View your personalized genomic cardiovascular assessment, prevention checklist, and drug testing results.'}
                  </p>
                </div>

                {/* Instant 1-Click Demo Profiles */}
                <div className="mb-6 bg-[#EDEFEE] border border-[#D4D8D5] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#41403C] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D08856]" />
                      1-Click Instant Demo Login:
                    </span>
                    <span className="text-[10px] text-[#6F6D68] uppercase font-mono tracking-wider">No Password Required</span>
                  </div>

                  {selectedRole === 'doctor' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {doctorAccounts.map((doc) => (
                        <button
                          key={doc.email}
                          type="button"
                          onClick={() => handleQuickDoctorLogin(doc)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white hover:bg-[#FAF2EB] border border-[#D4D8D5] hover:border-[#D08856] transition-all text-left group cursor-pointer shadow-2xs"
                        >
                          <img
                            src={doc.avatarUrl}
                            alt={doc.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#D4D8D5]"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-[#41403C] group-hover:text-[#AA210F] transition-colors truncate">
                              {doc.name.split(',')[0]}
                            </p>
                            <p className="text-[10px] text-[#6F6D68] truncate">{doc.title}</p>
                            <p className="text-[9px] text-[#D08856] font-mono font-semibold">{doc.npiNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {SAMPLE_PATIENTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleQuickPatientLogin(p)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#FAF2EB] border border-[#D4D8D5] hover:border-[#D08856] transition-all text-left group cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#FAF2EB] border border-[#EACAB2] flex items-center justify-center text-xs font-bold text-[#A65B27]">
                              {p.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#41403C] group-hover:text-[#D08856] transition-colors">
                                {p.name} <span className="font-mono text-[10px] text-[#6F6D68]">({p.id})</span>
                              </p>
                              <p className="text-[10px] text-[#6F6D68]">
                                {p.age}y • {p.gender} • Case: {p.clinicalDiagnoses[0]}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-[#D08856] group-hover:translate-x-0.5 transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Sign In Alternative */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div className="relative flex items-center justify-center my-1">
                    <div className="border-t border-[#D4D8D5] w-full" />
                    <span className="bg-white px-3 text-[11px] text-[#6F6D68] uppercase tracking-wider absolute">
                      or sign in with credentials
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#41403C] mb-1">
                      {selectedRole === 'doctor' ? 'Institutional Email / NPI' : 'Patient Email or Portal ID'}
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'doctor'
                          ? 'dr.vance@biopulse-genomics.org'
                          : 'marcus.sterling@health.com or #882-XJ'
                      }
                      className="w-full bg-[#EDEFEE] border border-[#D4D8D5] rounded-xl px-3 py-2.5 text-xs text-[#41403C] placeholder-[#6F6D68] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-[#41403C]">
                        Password / Access Key
                      </label>
                      <button type="button" className="text-[11px] text-[#D08856] hover:underline cursor-pointer">
                        Forgot key?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#EDEFEE] border border-[#D4D8D5] rounded-xl px-3 py-2.5 text-xs text-[#41403C] placeholder-[#6F6D68] focus:outline-none focus:border-[#D08856] focus:ring-1 focus:ring-[#D08856] transition-colors"
                    />
                  </div>

                  {selectedRole === 'doctor' && (
                    <div>
                      <label className="block text-xs font-semibold text-[#41403C] mb-1">
                        State Medical License / Verified NPI
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full bg-[#EDEFEE] border border-[#D4D8D5] rounded-xl px-3 py-2 text-xs text-[#41403C] placeholder-[#6F6D68] focus:outline-none focus:border-[#D08856]"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6F6D68]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-white border-[#D4D8D5] text-[#AA210F] focus:ring-[#AA210F]"
                      />
                      <span>Keep me authenticated for 8 hours</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-[#41403C] hover:bg-[#2F2E2B] active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>
                      {selectedRole === 'doctor'
                        ? 'Enter Clinical Decision Workspace'
                        : 'Access Patient Health Dashboard'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#D08856]" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Portal Feature Highlights & Certification */}
            <div className="lg:col-span-5 bg-[#EDEFEE] border border-[#D4D8D5] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#41403C] mb-4 pb-3 border-b border-[#D4D8D5]">
                  <Hospital className="w-4 h-4 text-[#AA210F]" />
                  <span>
                    {selectedRole === 'doctor' ? 'Clinician Toolset Included' : 'Patient Health Features'}
                  </span>
                </div>

                {selectedRole === 'doctor' ? (
                  <div className="flex flex-col gap-3 text-xs text-[#41403C]">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#AA210F] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#41403C]">Multi-Condition PRS Engine:</strong> Instant polygenic risk scoring for CAD, T2D, Alzheimer's &amp; BRCA with gene-environment interaction.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#AA210F] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#41403C]">Pharmacogenomic Testing:</strong> Full drug reaction analytics (positive vs. negative response rates, SLCO1B1 myopathy, CYP2C19 clopidogrel resistance).
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#AA210F] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#41403C]">Diagnostic Requisitions:</strong> 1-click ordering for Lipoprotein(a), CAC scoring CT scans, and metabolic panels.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#AA210F] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#41403C]">Specialist Tele-Referral:</strong> Direct HL7/FHIR dispatch to clinical geneticists and cardio-prevention teams.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 text-xs text-[#41403C]">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#D08856] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#41403C]">Clear Risk Explanations:</strong> Plain-language breakdown of your hereditary DNA factors without confusing jargon.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#D08856] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#41403C]">Drug Testing Insights:</strong> Understand which medications react positively with your unique genetics and which need dosage changes.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#D08856] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#41403C]">Interactive Prevention Checklist:</strong> Track daily nutrition, blood pressure targets, and exercise routines.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#D08856] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#41403C]">What-If Risk Simulator:</strong> See how lowering LDL or improving blood pressure reduces your lifetime cardiac risk.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security & Clinical Notice */}
              <div className="mt-6 pt-4 border-t border-[#D4D8D5] bg-white rounded-xl p-3 text-[11px] text-[#6F6D68] flex items-start gap-2 border border-[#D4D8D5]">
                <Lock className="w-4 h-4 text-[#41403C] shrink-0 mt-0.5" />
                <span>
                  Protected Health Information (PHI) encrypted with AES-256 in transit and at rest.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#D4D8D5] py-3 text-center text-xs text-[#6F6D68] z-10 bg-white">
        <p>© 2026 BioPulse Genomics Institute. For clinical decision support &amp; authorized patient care.</p>
      </footer>
    </div>
  );
};
