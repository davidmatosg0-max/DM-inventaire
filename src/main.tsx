import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ErrorBoundary } from './app/components/ErrorBoundary';
import './styles/index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

async function bootstrapAndRender() {
  try {
    const { runAppBootstrap } = await import('./app/utils/appBootstrap');
    await runAppBootstrap();
  } catch (error) {
    console.error('Error durante el bootstrap inicial de la aplicación:', error);
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

void bootstrapAndRender();