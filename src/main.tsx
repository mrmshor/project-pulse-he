import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Custom Error Boundary implementation (instead of react-error-boundary)
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // Optional: reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">משהו השתבש</h1>
              <p className="text-gray-600 mb-4">
                אירעה שגיאה בלתי צפויה באפליקציה
              </p>
              <details className="text-right mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  פרטי שגיאה טכניים
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-left overflow-auto">
                  {this.state.error?.message || 'Unknown error occurred'}
                </pre>
              </details>
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                נסה שוב
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// טעינת הנתונים בעת הפעלת האפליקציה
async function initializeApp() {
  try {
    // בדיקה אם אנחנו בסביבת Tauri
    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    
    if (isTauri) {
      console.log('🚀 Initializing Tauri app...');
      
      // טעינת נתונים מהאחסון המקומי
      const { useProjectStore } = await import('./store/useProjectStore');
      const store = useProjectStore.getState();
      await store.loadFromNative();
      
      console.log('✅ App initialized successfully');
    } else {
      console.log('🌐 Running in browser mode');
    }
  } catch (error) {
    console.error('❌ Error initializing app:', error);
  }
}

// הפעלת האפליקציה
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// התחל האפליקציה
initializeApp().then(() => {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
});

// Service Worker registration (אופציונלי)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
