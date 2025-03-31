// src/services/authService.js
import Parse from 'parse';

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
      console.log('Tentativa de login para:', username);
      
      // Verificar se o Parse está inicializado
      if (!Parse.applicationId) {
        console.error('Parse não inicializado durante tentativa de login');
        throw new Error('Sistema não inicializado corretamente. Tente recarregar a página.');
      }
      
      console.log('Tentando login no Parse...');
      const user = await Parse.User.logIn(username, password);
      console.log('Login bem-sucedido para:', username);
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
      // Verificar se o Parse está inicializado
      if (!Parse.applicationId) {
        console.error('Parse não inicializado. Não é possível fazer logout');
        return false;
      }
      
      console.log('Realizando logout do usuário');
      await Parse.User.logOut();
      console.log('Logout realizado com sucesso');
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
      // Verificar se o Parse está inicializado
      if (!Parse.applicationId) {
        console.error('Parse não inicializado no getCurrentUser. Retornando null.');
        return null;
      }
      
      const currentUser = Parse.User.current();
      console.log('Usuário atual verificado:', currentUser ? currentUser.getUsername() : 'Nenhum');
      return currentUser;
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
      // Verificar se o Parse está inicializado
      if (!Parse.applicationId) {
        console.error('Parse não inicializado na tentativa de registro');
        throw new Error('Sistema não inicializado corretamente');
      }
      
      console.log('Registrando novo usuário:', username);
      const user = new Parse.User();
      user.set("username", username);
      user.set("password", password);
      user.set("email", email);
      
      const newUser = await user.signUp();
      console.log('Usuário registrado com sucesso');
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
      if (!Parse.applicationId) {
        console.error('Parse não inicializado na verificação de conexão');
        return false;
      }
      
      console.log('Verificando conexão com o Parse');
      // Tenta fazer uma operação simples para testar a conexão
      const TestObject = Parse.Object.extend('Prices');
      const query = new Parse.Query(TestObject);
      await query.count();
      console.log('Conexão com Parse verificada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao verificar conexão com o Parse:', error);
      return false;
    }
  }
};

export default authService;
