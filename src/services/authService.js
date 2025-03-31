import Parse from 'parse/dist/parse.min.js';

/**
 * Inicializa o Parse se ainda não estiver inicializado
 * @returns {boolean} - Se a inicialização foi bem-sucedida
 */
const ensureParseInitialized = () => {
  if (Parse.applicationId) {
    return true;
  }
  
  try {
    if (!import.meta.env.VITE_PARSE_APP_ID || 
        !import.meta.env.VITE_PARSE_JS_KEY || 
        !import.meta.env.VITE_PARSE_SERVER_URL) {
      console.error('Variáveis de ambiente do Parse não encontradas');
      return false;
    }
    
    Parse.initialize(
      import.meta.env.VITE_PARSE_APP_ID,
      import.meta.env.VITE_PARSE_JS_KEY
    );
    Parse.serverURL = import.meta.env.VITE_PARSE_SERVER_URL;
    
    console.log('Parse inicializado com sucesso em authService');
    return !!Parse.applicationId;
  } catch (error) {
    console.error('Erro ao inicializar Parse em authService:', error);
    return false;
  }
};

/**
 * Serviço de autenticação que contém métodos para login, logout, etc.
 */
const authService = {
  /**
   * Realiza o login do usuário usando o Parse
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise} - Promise resolvida com o usuário logado ou rejeitada com erro
   */
  login: async (username, password) => {
    try {
      // Verifica se o Parse está inicializado
      if (!ensureParseInitialized()) {
        throw new Error('Parse não inicializado corretamente');
      }
      
      const user = await Parse.User.logIn(username, password);
      return user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  /**
   * Realiza o logout do usuário atual
   * @returns {Promise} - Promise resolvida após o logout
   */
  logout: async () => {
    try {
      // Verifica se o Parse está inicializado
      if (!ensureParseInitialized()) {
        console.error('Parse não inicializado. Não é possível fazer logout');
        return false;
      }
      
      await Parse.User.logOut();
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },

  /**
   * Verifica se existe um usuário logado atualmente
   * @returns {Parse.User|null} - O usuário atual ou null
   */
  getCurrentUser: () => {
    try {
      // Verifica se o Parse está inicializado
      if (!ensureParseInitialized()) {
        console.error('Parse não inicializado no getCurrentUser. Retornando null.');
        return null;
      }
      
      return Parse.User.current();
    } catch (error) {
      console.error('Erro ao verificar usuário atual:', error);
      return null;
    }
  },
  
  /**
   * Registra um novo usuário no sistema
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha do usuário
   * @param {string} email - Email do usuário
   * @returns {Promise} - Promise resolvida com o usuário criado
   */
  register: async (username, password, email) => {
    try {
      // Verifica se o Parse está inicializado
      if (!ensureParseInitialized()) {
        throw new Error('Parse não inicializado corretamente');
      }
      
      const user = new Parse.User();
      user.set("username", username);
      user.set("password", password);
      user.set("email", email);
      
      const newUser = await user.signUp();
      return newUser;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  },

  /**
   * Verifica se a conexão com o Parse está funcionando
   * @returns {Promise<boolean>} - Promise resolvida com true se estiver funcionando
   */
  checkConnection: async () => {
    try {
      if (!ensureParseInitialized()) {
        return false;
      }
      
      // Tenta fazer uma operação simples para testar a conexão
      await Parse.Cloud.run('ping', {});
      return true;
    } catch (error) {
      console.error('Erro ao verificar conexão com o Parse:', error);
      return false;
    }
  }
};

export default authService;