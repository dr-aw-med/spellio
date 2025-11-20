// Configuration globale pour les tests Jest
import '@testing-library/jest-dom';

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock de Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de Web Speech API
global.SpeechRecognition = class {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'fr-FR';
    this.onstart = null;
    this.onend = null;
    this.onresult = null;
    this.onerror = null;
  }
  start() {}
  stop() {}
  abort() {}
};

global.webkitSpeechRecognition = global.SpeechRecognition;

// Nettoyer après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

