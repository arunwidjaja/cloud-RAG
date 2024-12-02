import { AuthProvider } from '@/contexts/AuthContext';

// Pages
import LoginPage from '@/components/Page_Login';
import RegisterPage from '@/components/Page_Register';
import MainApp from '@/components/Page_Main';

import { ProtectedRoute } from './components/ProtectedRoute';

// Styling
import '@/App.css';

// Hooks
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/Page_Landing';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path='/landing'
            element={<LandingPage />}
          >
          </Route>
          <Route
            path="/login"
            element={<LoginPage />}>
          </Route>
          <Route
            path="/register"
            element={<RegisterPage />}>
          </Route>
          <Route
            path="/"
            element={<ProtectedRoute><MainApp /></ProtectedRoute>}>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
