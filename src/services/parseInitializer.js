
// src/services/parseInitializer.js
import Parse from 'parse';

let initialized = false;

export const initializeParse = () => {
  if (initialized || Parse.applicationId) {
    return true;
  }

  try {
    const appId = import.meta.env.VITE_PARSE_APP_ID;
    const jsKey = import.meta.env.VITE_PARSE_JS_KEY;
    const serverURL = import.meta.env.VITE_PARSE_SERVER_URL;

    if (!appId || !jsKey || !serverURL) {
      console.error('Variáveis de ambiente do Parse não encontradas');
      return false;
    }

    Parse.initialize(appId, jsKey);
    Parse.serverURL = serverURL;
    initialized = true;
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Parse:', error);
    return false;
  }
};

export default Parse;
