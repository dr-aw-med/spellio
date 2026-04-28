import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { WordListEditor } from './components/WordListEditor';
import { ModeSelector } from './components/ModeSelector';
import { WordDictation } from './components/WordDictation';
import { StoryDictation } from './components/StoryDictation';
import { LoginScreen } from './components/LoginScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ChildSelect } from './components/ChildSelect';
import { ParentDashboard } from './components/ParentDashboard';
import { ResetPassword } from './components/ResetPassword';
import { FinishScreen } from './components/FinishScreen';
import { Modal } from './components/Modal';
import { extractWordsFromImage } from './services/api';
import { signOut } from './services/authService';
import { AppStep, UserRole, Child } from './types';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'success' | 'warning' | 'info';
  onConfirm?: () => void;
}

interface DictationMeta {
  code: string;
  title: string;
  mode: 'word' | 'story';
}

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.LOGIN);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [words, setWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);
  const [dictationMeta, setDictationMeta] = useState<DictationMeta | null>(null);
  const [storyIllustration, setStoryIllustration] = useState<string | null>(null);
  const [storyText, setStoryText] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setShowResetPassword(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const showModal = (title: string, message: string, variant: ModalState['variant'] = 'info', onConfirm?: () => void) => {
    setModal({ isOpen: true, title, message, variant, onConfirm });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Navigation centralisée par rôle
  const navigateToRoleHome = () => {
    setWords([]);
    setDictationMeta(null);
    setStoryIllustration(null);
    setStoryText(null);
    if (userRole === 'TEACHER') {
      setStep(AppStep.TEACHER_DASHBOARD);
    } else if (userRole === 'PARENT') {
      setActiveChild(null);
      setStep(AppStep.CHILD_SELECT);
    } else {
      setStep(AppStep.UPLOAD);
    }
  };

  const handleLogout = () => {
    showModal(
      'Se déconnecter ?',
      'Tu vas revenir à l\'écran d\'accueil.',
      'info',
      async () => {
        if (userRole === 'TEACHER' || userRole === 'PARENT') await signOut();
        setStep(AppStep.LOGIN);
        setUserRole(null);
        setWords([]);
        setActiveChild(null);
        setParentName(null);
        setDictationMeta(null);
        closeModal();
      }
    );
  };

  const handleHome = () => {
    const inDictation = step === AppStep.DICTATION_WORD || step === AppStep.DICTATION_STORY;

    if (inDictation) {
      showModal(
        'Arrêter la dictée ?',
        'Ta progression ne sera pas sauvegardée.',
        'warning',
        () => { navigateToRoleHome(); closeModal(); }
      );
    } else {
      navigateToRoleHome();
    }
  };

  const handleRoleSelect = (role: UserRole, firstName?: string) => {
    setUserRole(role);
    if (role === 'TEACHER') {
      setStep(AppStep.TEACHER_DASHBOARD);
    } else if (role === 'PARENT') {
      setParentName(firstName || null);
      setStep(AppStep.CHILD_SELECT);
    } else {
      setStep(AppStep.UPLOAD);
    }
  };

  const handleChildSelected = (child: Child) => {
    setActiveChild(child);
    setStep(AppStep.UPLOAD);
  };

  const handleSignupPrompt = () => {
    showModal(
      'Mode réservé !',
      'L\'histoire magique est gratuite avec un compte Parent. Crée-en un depuis l\'accueil !',
      'info'
    );
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

  const handleCodeValidated = (loadedWords: string[], code?: string, title?: string) => {
    setWords(loadedWords);
    setDictationMeta(prev => ({ ...prev, code: code || 'MANUAL', title: title || 'Dictée', mode: prev?.mode || 'word' }));
    setStep(AppStep.CHOOSE_MODE);
  };

  const handleDictationFinish = (illustration?: string, fullText?: string) => {
    if (illustration) setStoryIllustration(illustration);
    if (fullText) setStoryText(fullText);
    setStep(AppStep.FINISHED);
  };

  if (showResetPassword) {
    return (
      <div className="app-bg font-[Fredoka] text-slate-900 pb-10">
        <Header onLogout={() => {}} onHome={() => {}} onLogoClick={() => {}} userRole={null} />
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
      case AppStep.CHILD_SELECT:
        return (
          <ChildSelect
            onSelectChild={handleChildSelected}
            onViewProgress={() => setStep(AppStep.PARENT_DASHBOARD)}
            parentName={parentName}
          />
        );
      case AppStep.PARENT_DASHBOARD:
        return (
          <ParentDashboard
            onBack={() => setStep(AppStep.CHILD_SELECT)}
            onSelectChild={handleChildSelected}
          />
        );
      case AppStep.UPLOAD:
        return (
          <ImageUploader
            onImageSelected={handleImageSelected}
            onCodeValidated={handleCodeValidated}
            isProcessing={isProcessing}
            activeChild={activeChild}
            onChildLogin={(child) => setActiveChild(child)}
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
        return (
          <ModeSelector
            onSelect={(s) => {
              const mode = s === AppStep.DICTATION_STORY ? 'story' : 'word';
              setDictationMeta(prev => ({ code: prev?.code || 'MANUAL', title: prev?.title || 'Dictée', mode }));
              setStep(s);
            }}
            userRole={userRole}
            onSignupPrompt={handleSignupPrompt}
          />
        );
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
            onFinish={handleDictationFinish}
            onBack={() => setStep(AppStep.CHOOSE_MODE)}
          />
        );
      case AppStep.FINISHED:
        return (
          <FinishScreen
            words={words}
            activeChild={activeChild}
            dictationCode={dictationMeta?.code}
            dictationTitle={dictationMeta?.title}
            mode={dictationMeta?.mode}
            illustration={storyIllustration}
            storyFullText={storyText}
            onRetry={() => setStep(AppStep.CHOOSE_MODE)}
            onRetryChild={() => setStep(AppStep.UPLOAD)}
            onNew={navigateToRoleHome}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-bg font-[Fredoka] text-slate-900 pb-10">
      <Header
        onLogout={handleLogout}
        onHome={handleHome}
        onLogoClick={handleLogout}
        userRole={userRole}
        activeChildName={activeChild ? `${activeChild.avatar} ${activeChild.first_name}` : undefined}
        showHome={
          !(userRole === 'STUDENT' && step === AppStep.UPLOAD) &&
          !(userRole === 'TEACHER' && step === AppStep.TEACHER_DASHBOARD) &&
          !(userRole === 'PARENT' && step === AppStep.CHILD_SELECT)
        }
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
