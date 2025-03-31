import React, { createContext, useState, useEffect, useContext } from 'react';
import Parse from 'parse';

// Criar contexto
const ParseContext = createContext(null);

// Hook personalizado para usar o contexto
export const useParse = () => useContext(ParseContext);

// Provedor do contexto
export const ParseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar o Parse
  useEffect(() => {
    const initializeParse = async () => {
      try {
        setIsLoading(true);
        
        // Log detalhado das variáveis de ambiente
        console.log('Variáveis de ambiente:', {
          appId: import.meta.env.VITE_PARSE_APP_ID,
          jsKey: import.meta.env.VITE_PARSE_JS_KEY ? '[PRESENTE]' : '[AUSENTE]',
          serverURL: import.meta.env.VITE_PARSE_SERVER_URL
        });
        
        // Verificar se já está inicializado
        if (Parse.applicationId) {
          console.log('Parse já inicializado em ParseContext');
          setIsInitialized(true);
          setError(null);
          setIsLoading(false);
          return;
        }
        
        // Obter variáveis de ambiente
        const appId = import.meta.env.VITE_PARSE_APP_ID;
        const jsKey = import.meta.env.VITE_PARSE_JS_KEY;
        const serverURL = import.meta.env.VITE_PARSE_SERVER_URL;
        
        // Verificar se as variáveis existem
        if (!appId || !jsKey || !serverURL) {
          throw new Error('Variáveis de ambiente do Parse incompletas: ' + 
            JSON.stringify({
              appId: !!appId, 
              jsKey: !!jsKey, 
              serverURL: !!serverURL
            }));
        }
        
        // Inicializar o Parse
        console.log('Tentando inicializar Parse...');
        Parse.initialize(appId, jsKey);
        Parse.serverURL = serverURL;
        
        // Verificar se inicializou
        console.log('Parse após inicialização:', {
          applicationId: Parse.applicationId,
          serverURL: Parse.serverURL,
          javascriptKey: Parse._getJSKey()
        });

        if (Parse.applicationId) {
          console.log('Parse inicializado com sucesso em ParseContext');
          setIsInitialized(true);
          setError(null);
        } else {
          throw new Error('Parse não inicializado corretamente');
        }
      } catch (err) {
        console.error('Erro detalhado ao inicializar Parse:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setError(err.message || 'Erro desconhecido na inicialização');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeParse();
  }, []);

  // Exporta o estado e funções relevantes
  const parseContextValue = {
    isInitialized,
    isLoading,
    error,
    Parse,
    // Tentar inicializar novamente
    reinitialize: async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Obter variáveis de ambiente
        const appId = import.meta.env.VITE_PARSE_APP_ID;
        const jsKey = import.meta.env.VITE_PARSE_JS_KEY;
        const serverURL = import.meta.env.VITE_PARSE_SERVER_URL;
        
        // Inicializar o Parse
        Parse.initialize(appId, jsKey);
        Parse.serverURL = serverURL;
        
        if (Parse.applicationId) {
          setIsInitialized(true);
          setError(null);
        } else {
          throw new Error('Parse não inicializado corretamente');
        }
      } catch (err) {
        console.error('Erro ao reinicializar Parse:', err);
        setError(err.message);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ParseContext.Provider value={parseContextValue}>
      {children}
    </ParseContext.Provider>
  );
};

export default ParseContext;
