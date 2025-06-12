import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { EntrenadoresProvider } from './context/EntrenadoresContext';

function App() {
  return (
    <EntrenadoresProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Layout>
              <AppRoutes />
            </Layout>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </EntrenadoresProvider>
  );
}

export default App;
