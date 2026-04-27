import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { WordListEditor } from './components/WordListEditor';
import { ModeSelector } from './components/ModeSelector';
import { WordDictation } from './components/WordDictation';
import { StoryDictation } from './components/StoryDictation';
import { LoginScreen } from './components/LoginScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ResetPassword } from './components/ResetPassword';
import { Modal } from './components/Modal';
import { extractWordsFromImage } from './services/api';
import { signOut } from './services/authService';
import { AppStep, UserRole } from './types';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'success' | 'warning' | 'info';
  onConfirm?: () => void;
}

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.LOGIN);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [words, setWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
  });

  // Détecter le token de reset password dans l'URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setShowResetPassword(true);
      // Nettoyer l'URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const showModal = (title: string, message: string, variant: ModalState['variant'] = 'info', onConfirm?: () => void) => {
    setModal({ isOpen: true, title, message, variant, onConfirm });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleLogout = () => {
    showModal(
      'Se déconnecter ?',
      'Tu vas revenir à l\'écran d\'accueil.',
      'warning',
      async () => {
        if (userRole === 'TEACHER') await signOut();
        setStep(AppStep.LOGIN);
        setUserRole(null);
        setWords([]);
        closeModal();
      }
    );
  };

  const handleHome = () => {
    const inDictation = step === AppStep.DICTATION_WORD || step === AppStep.DICTATION_STORY;

    const goHome = () => {
      setWords([]);
      if (userRole === 'TEACHER') {
        setStep(AppStep.TEACHER_DASHBOARD);
      } else {
        setStep(AppStep.UPLOAD);
      }
      closeModal();
    };

    if (inDictation) {
      showModal(
        'Arrêter la dictée ?',
        'Ta progression ne sera pas sauvegardée.',
        'warning',
        goHome
      );
    } else {
      goHome();
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === 'TEACHER') {
      setStep(AppStep.TEACHER_DASHBOARD);
    } else {
      setStep(AppStep.UPLOAD);
    }
  };

  const handleImageSelected = async (base64: string, mimeType: string) => {
    setIsProcessing(true);
    try {
      const extractedWords = await extractWordsFromImage(base64, mimeType);
      setWords(extractedWords);
      setStep(AppStep.VERIFY);
    } catch {
      showModal(
        'Oups !',
        'Je n\'ai pas réussi à lire l\'image. Essaie avec une photo plus claire.',
        'warning'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWordsConfirmed = (confirmedWords: string[]) => {
    setWords(confirmedWords);
    setStep(AppStep.CHOOSE_MODE);
  };

  const handleCodeValidated = (loadedWords: string[]) => {
    setWords(loadedWords);
    setStep(AppStep.CHOOSE_MODE);
  };

  const handleDictationFinish = () => {
    showModal('Bravo !', 'Tu as terminé ta dictée !', 'success');
    setStep(AppStep.CHOOSE_MODE);
  };

  // Écran de reset password
  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-slate-50 font-[Fredoka] text-slate-900 pb-10">
        <Header onLogout={() => {}} onHome={() => {}} userRole={null} />
        <main className="container mx-auto max-w-3xl pt-6 px-4">
          <ResetPassword onDone={() => {
            setShowResetPassword(false);
            showModal('Mot de passe modifié !', 'Tu peux maintenant te connecter.', 'success');
          }} />
        </main>
      </div>
    );
  }

  const renderContent = () => {
    switch (step) {
      case AppStep.LOGIN:
        return <LoginScreen onSelectRole={handleRoleSelect} />;
      case AppStep.TEACHER_DASHBOARD:
        return <TeacherDashboard />;
      case AppStep.UPLOAD:
        return (
          <ImageUploader
            onImageSelected={handleImageSelected}
            onCodeValidated={handleCodeValidated}
            isProcessing={isProcessing}
          />
        );
      case AppStep.VERIFY:
        return (
          <WordListEditor
            words={words}
            onConfirm={handleWordsConfirmed}
            onRetake={() => setStep(AppStep.UPLOAD)}
          />
        );
      case AppStep.CHOOSE_MODE:
        return <ModeSelector onSelect={setStep} />;
      case AppStep.DICTATION_WORD:
        return (
          <WordDictation
            words={words}
            onFinish={handleDictationFinish}
            onBack={() => setStep(AppStep.CHOOSE_MODE)}
          />
        );
      case AppStep.DICTATION_STORY:
        return (
          <StoryDictation
            words={words}
            onBack={() => setStep(AppStep.CHOOSE_MODE)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[Fredoka] text-slate-900 pb-10">
      <Header
        onLogout={handleLogout}
        onHome={handleHome}
        onLogoClick={handleLogout}
        userRole={userRole}
        showHome={!(userRole === 'STUDENT' && step === AppStep.UPLOAD)}
      />
      <main className="container mx-auto max-w-3xl pt-6 px-4">
        {renderContent()}
      </main>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
      />
    </div>
  );
}

export default App;
