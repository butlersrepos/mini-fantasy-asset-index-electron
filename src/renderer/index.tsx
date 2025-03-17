import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Consider using this in development but removing for production
const StrictModeWrapper = ({ children }: { children: React.ReactNode }) => {
  // Only use StrictMode in development
  if (process.env.NODE_ENV === 'development') {
    return <React.StrictMode>{children}</React.StrictMode>;
  }
  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictModeWrapper>
    <App />
  </StrictModeWrapper>
);
