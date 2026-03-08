//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,
  <GoogleOAuthProvider clientId="390284729925-eedemtsoprbgcumtkva8or9r6l8kh9fv.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>,
)
