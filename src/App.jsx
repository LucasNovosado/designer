import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ParseProvider, useParse } from './context/ParseContext';

// Componente que depende do estado de inicialização do Parse
const AppContent = () => {
  const { isInitialized, isLoading, error, reinitialize } = useParse();

  // Log adicional para depuração
  console.log('Estado do Parse em AppContent:', { isInitialized, isLoading, error });

  // Mostra tela de carregamento enquanto o Parse está inicializando
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#121212',
        color: '#e0e0e0',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ffd100', marginTop: '0' }}>Inicializando sistema</h3>
          <p>Por favor, aguarde enquanto nos conectamos ao servidor...</p>
          <div style={{ 
            height: '4px', 
            width: '100%', 
            backgroundColor: '#333',
            overflow: 'hidden',
            borderRadius: '2px',
            marginTop: '15px'
          }}>
            <div style={{
              height: '100%',
              width: '30%',
              background: 'linear-gradient(90deg, #ffd100, #3498db)',
              animation: 'loading 1.5s infinite',
            }}></div>
          </div>
          <style>{`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(400%); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Mostra tela de erro caso falhe
  if (error || !isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#121212',
        color: '#e0e0e0',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ffd100', marginTop: '0' }}>Erro: Sistema não inicializado corretamente</h3>
          <p>Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.</p>
          {error && (
            <div>
              <p style={{ fontSize: '0.9rem', color: '#ff6b6b', marginTop: '1rem', backgroundColor: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '5px' }}>
                Detalhes do erro: {error}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>
                Verifique se as variáveis de ambiente estão configuradas corretamente.
              </p>
            </div>
          )}
          
          <button 
            onClick={reinitialize} 
            style={{
              marginTop: '1rem',
              padding: '0.6rem 1.5rem',
              background: 'linear-gradient(90deg, #3498db, #2980b9)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Quando inicializado com sucesso, mostra a aplicação
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

// Componente principal que envolve tudo com o provedor de Parse
const App = () => {
  console.log('Inicializando App com ParseProvider');
  
  return (
    <ParseProvider>
      <AppContent />
    </ParseProvider>
  );
};

export default App;
