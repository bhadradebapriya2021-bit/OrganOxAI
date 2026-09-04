/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ActiveTab, ConditionId, PatientData, AuthUser } from './types';
import { INITIAL_PATIENT, SAMPLE_PATIENTS } from './data/clinicalData';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OverviewView } from './components/OverviewView';
import { GeneticRiskView } from './components/GeneticRiskView';
import { ModifiableFactorsView } from './components/ModifiableFactorsView';
import { PreventionMatrixView } from './components/PreventionMatrixView';
import { DrugTestingResultsView } from './components/DrugTestingResultsView';
import { ClinicalDataInput } from './components/ClinicalDataInput';
import { PatientReportPrintView } from './components/PatientReportPrintView';
import { OrderTestModal } from './components/OrderTestModal';
import { ReferralModal } from './components/ReferralModal';
import { NotificationDrawer, ClinicalNotification } from './components/NotificationDrawer';
import { InfoModal } from './components/InfoModal';
import { ModelTestingDashboard } from './components/ModelTestingDashboard';
import { CheckCircle2 } from 'lucide-react';

const TAB_PATHS: Record<ActiveTab, string> = {
  overview: '/overview',
  genetic: '/genetic',
  modifiable: '/modifiable',
  prevention: '/prevention',
  'drug-testing': '/drug-testing',
  input: '/input',
  reports: '/reports',
};

const PATH_TABS: Record<string, ActiveTab> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab as ActiveTab]),
) as Record<string, ActiveTab>;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const activeTab = PATH_TABS[location.pathname] ?? 'overview';
  const setActiveTab = (tab: ActiveTab) => navigate(TAB_PATHS[tab]);

  const [selectedCondition, setSelectedCondition] = useState<ConditionId>('cad');
  const [patient, setPatient] = useState<PatientData>(INITIAL_PATIENT);

  const [isOrderTestOpen, setIsOrderTestOpen] = useState(false);
  const [orderTestName, setOrderTestName] = useState<string>(
    'Lipoprotein(a) [Lp(a)] & Lipid Subfraction Assay',
  );
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'help' | 'privacy' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<ClinicalNotification[]>([
    {
      id: 'n1',
      title: 'Pharmacogenomic Allele Alert',
      message: 'SLCO1B1 rs4149056 521T>C detected: high myopathy risk on standard 40mg Atorvastatin.',
      time: '10m ago',
      type: 'critical',
      read: false,
    },
    {
      id: 'n2',
      title: 'CYP2C19 *2 Clopidogrel Resistance',
      message: 'Loss-of-function allele identified. Consider Prasugrel or Ticagrelor per CPIC guideline.',
      time: '45m ago',
      type: 'critical',
      read: false,
    },
    {
      id: 'n3',
      title: 'Genomic Sequencing Pipeline v4.2 Complete',
      message: 'Variant calling against GRCh38 reference completed with 99.8% Q30 depth.',
      time: '1h ago',
      type: 'success',
      read: false,
    },
    {
      id: 'n4',
      title: 'Clinical Guideline Synchronized',
      message: 'Updated ACC/AHA cardiovascular prevention matrix loaded into clinical core.',
      time: '3h ago',
      type: 'info',
      read: true,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLogin = (user: AuthUser, selectedPatient?: PatientData) => {
    setCurrentUser(user);

    if (selectedPatient) {
      setPatient(selectedPatient);
    }

    navigate('/overview');
    showToast(`Welcome, ${user.name} (${user.role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleOrderTestTrigger = (testName?: string) => {
    if (testName) {
      setOrderTestName(testName);
    }

    setIsOrderTestOpen(true);
  };

  const handleConfirmOrder = (summary: string) => {
    showToast(`Order Confirmed: ${summary}`);

    const newNotif: ClinicalNotification = {
      id: 'order-' + Date.now(),
      title: 'Lab Requisition Dispatched',
      message: `Requisition created for ${summary}. Specimen collection scheduled.`,
      time: 'Just now',
      type: 'success',
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleConfirmReferral = (summary: string) => {
    showToast(`Referral Dispatched: ${summary}`);

    const newNotif: ClinicalNotification = {
      id: 'ref-' + Date.now(),
      title: 'Genetic Referral Transmitted',
      message: `${summary} transmitted to Telehealth Network.`,
      time: 'Just now',
      type: 'success',
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdatePatient = (updated: PatientData) => {
    setPatient(updated);
    showToast('Patient biometrics & biomarkers updated successfully.');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (location.pathname === '/model-testing') {
    return <ModelTestingDashboard onExit={() => navigate('/')} />;
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} onOpenModelTesting={() => navigate('/model-testing')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const dashboard = (
    <div className="min-h-screen bg-[#EDEFEE] text-[#41403C] flex flex-col font-['Roboto',sans-serif] selection:bg-[#F1DDD0] selection:text-[#8A4A1C]">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#41403C] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-[13px] font-medium animate-in slide-in-from-top duration-200 border border-[#D08856]/40">
          <CheckCircle2 className="w-4 h-4 text-[#D08856]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {activeTab !== 'reports' && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCondition={selectedCondition}
          setSelectedCondition={setSelectedCondition}
          patient={patient}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={unreadCount}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {activeTab === 'reports' ? (
        <main className="w-full flex-1">
          <PatientReportPrintView
            patient={patient}
            conditionId={selectedCondition}
            onBack={() => setActiveTab('overview')}
          />
        </main>
      ) : (
        <div className="flex flex-1 max-w-[1280px] mx-auto w-full">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            patient={patient}
            onSelectPatient={(selectedP) => {
              setPatient(selectedP);
              showToast(`Loaded Patient Case: ${selectedP.name} (${selectedP.id})`);
            }}
            onExportReport={() => setActiveTab('reports')}
            onOrderTest={() => handleOrderTestTrigger('Expanded 16-Gene Pharmacogenomic Testing Panel')}
            onReferral={() => setIsReferralOpen(true)}
            onOpenHelp={() => setInfoModalType('help')}
            onOpenPrivacy={() => setInfoModalType('privacy')}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          <main className="flex-1 md:pl-72 px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-12 w-full overflow-x-hidden">
            {activeTab === 'overview' && (
              <OverviewView
                patient={patient}
                conditionId={selectedCondition}
                onSelectCondition={setSelectedCondition}
                onNavigateTab={setActiveTab}
                onOrderTests={handleOrderTestTrigger}
                onReferral={() => setIsReferralOpen(true)}
                onExportReport={() => setActiveTab('reports')}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'genetic' && (
              <GeneticRiskView
                patient={patient}
                conditionId={selectedCondition}
                onSelectCondition={setSelectedCondition}
                onReferral={() => setIsReferralOpen(true)}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'modifiable' && (
              <ModifiableFactorsView
                patient={patient}
                conditionId={selectedCondition}
                onSelectCondition={setSelectedCondition}
                onNavigateToDataInput={() => setActiveTab('input')}
                onOrderTests={handleOrderTestTrigger}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'prevention' && (
              <PreventionMatrixView
                patient={patient}
                conditionId={selectedCondition}
                onSelectCondition={setSelectedCondition}
                onExportReport={() => setActiveTab('reports')}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'drug-testing' && (
              <DrugTestingResultsView
                patient={patient}
                currentUser={currentUser}
                onOrderTest={handleOrderTestTrigger}
                onNavigateToDataInput={() => setActiveTab('input')}
              />
            )}

            {activeTab === 'input' && (
              <ClinicalDataInput
                patient={patient}
                onUpdatePatient={handleUpdatePatient}
                onNavigateToOverview={() => setActiveTab('overview')}
              />
            )}
          </main>
        </div>
      )}

      {activeTab !== 'reports' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <OrderTestModal
        isOpen={isOrderTestOpen}
        onClose={() => setIsOrderTestOpen(false)}
        defaultTestName={orderTestName}
        patient={patient}
        onConfirmOrder={handleConfirmOrder}
      />

      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        patient={patient}
        onConfirmReferral={handleConfirmReferral}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
        onDismiss={(id) => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }}
      />

      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<LoginPage onLogin={handleLogin} onOpenModelTesting={() => navigate('/model-testing')} />} />

      {Object.values(TAB_PATHS).map(path => (
        <React.Fragment key={path}>
          <Route path={path} element={dashboard} />
        </React.Fragment>
      ))}

      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
