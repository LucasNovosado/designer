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

  // Função para inicializar o Parse
  const initializeParse = async () => {
    try {
      // Se já estiver inicializado, retorne
      if (Parse.applicationId) {
        console.log('Parse já inicializado');
        setIsInitialized(true);
        setError(null);
        return true;
      }
      
      // Obter variáveis de ambiente
      const appId = import.meta.env.VITE_PARSE_APP_ID;
      const jsKey = import.meta.env.VITE_PARSE_JS_KEY;
      const serverURL = import.meta.env.VITE_PARSE_SERVER_URL;
      
      // Verificar se as variáveis existem
      if (!appId || !jsKey || !serverURL) {
        console.error('Variáveis de ambiente do Parse não encontradas');
        throw new Error('Variáveis de ambiente do Parse não encontradas');
      }
      
      // Inicializar o Parse
      Parse.initialize(appId, jsKey);
      Parse.serverURL = serverURL;
      
      console.log('Parse inicializado com sucesso:', Parse.applicationId);
      return true;
    } catch (error) {
      console.error('Erro ao inicializar Parse:', error);
      throw error;
    }
  };

  // Inicializar o Parse ao montar o componente
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await initializeParse();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Erro na inicialização do Parse:', err);
        setError(err.message);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Função para reinicializar o Parse
  const reinitialize = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await initializeParse();
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Erro ao reinicializar Parse:', err);
      setError(err.message);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const parseContextValue = {
    isInitialized,
    isLoading,
    error,
    Parse,
    reinitialize
  };

  return (
    <ParseContext.Provider value={parseContextValue}>
      {children}
    </ParseContext.Provider>
  );
};

export default ParseContext;
