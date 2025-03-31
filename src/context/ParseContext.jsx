// src/context/ParseContext.jsx
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
        
        console.log('Tentando inicializar Parse com:', { 
          appId: !!appId, 
          jsKey: !!jsKey, 
          serverURL: !!serverURL 
        });
        
        // Verificar se as variáveis existem
        if (!appId || !jsKey || !serverURL) {
          throw new Error('Variáveis de ambiente do Parse incompletas');
        }
        
        // Inicializar o Parse
        Parse.initialize(appId, jsKey);
        Parse.serverURL = serverURL;
        
        // Testar a conexão
        try {
          // Verificar se inicializou
          if (Parse.applicationId) {
            // Testar a conexão com uma consulta simples
            const TestObject = Parse.Object.extend('Prices');
            const query = new Parse.Query(TestObject);
            await query.count();
            
            console.log('Parse inicializado com sucesso e conexão testada em ParseContext');
            setIsInitialized(true);
            setError(null);
          } else {
            throw new Error('Parse não inicializado corretamente');
          }
        } catch (testError) {
          console.error('Erro ao testar conexão:', testError);
          throw new Error(`Erro ao testar conexão: ${testError.message}`);
        }
      } catch (err) {
        console.error('Erro ao inicializar Parse:', err);
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
        
        console.log('Tentando reinicializar Parse');
        
        // Inicializar o Parse
        Parse.initialize(appId, jsKey);
        Parse.serverURL = serverURL;
        
        // Testar a conexão
        try {
          // Testar a conexão com uma consulta simples
          const TestObject = Parse.Object.extend('Prices');
          const query = new Parse.Query(TestObject);
          await query.count();
          
          console.log('Parse reinicializado com sucesso e conexão testada');
          setIsInitialized(true);
          setError(null);
        } catch (testError) {
          console.error('Erro ao testar conexão na reinicialização:', testError);
          throw new Error(`Erro ao testar conexão: ${testError.message}`);
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
