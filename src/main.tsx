import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found! Make sure #root exists in index.html');
  }
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Failed to initialize app:', error);
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #0F172A;
      color: #EF4444;
      font-family: monospace;
      padding: 20px;
      text-align: center;
    ">
      <h1 style="font-size: 20px; margin-bottom: 10px;">🔴 Initialization Failed</h1>
      <p style="font-size: 12px; margin-bottom: 10px;">Check browser console for details</p>
      <p style="font-size: 10px; color: #94A3B8;">${error instanceof Error ? error.message : String(error)}</p>
    </div>
  `;
}
  