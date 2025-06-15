import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { EntrenadoresProvider } from './context/EntrenadoresContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <AppProvider>
            <EntrenadoresProvider>
              <Layout>
                <AppRoutes />
              </Layout>
            </EntrenadoresProvider>
          </AppProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
