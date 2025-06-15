import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { EntrenadoresProvider } from './context/EntrenadoresContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <EntrenadoresProvider>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <AppProvider>
              <Layout>
                <AppRoutes />
              </Layout>
            </AppProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </EntrenadoresProvider>
  );
}

export default App;
