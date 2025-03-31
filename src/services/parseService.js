// src/services/parseService.js

import Parse from 'parse';

// Variável para controlar se já foi inicializado
let initialized = false;

/**
 * Inicializa o Parse uma única vez
 * @returns {boolean} - Se a inicialização foi bem-sucedida
 */
const initializeParse = () => {
  // Se já tiver sido inicializado, retorna verdadeiro
  if (initialized || Parse.applicationId) {
    console.log('Parse já inicializado:', Parse.applicationId);
    return true;
  }
  
  try {
    console.log('Inicializando Parse...');
    
    // Obtém as variáveis de ambiente
    const appId = import.meta.env.VITE_PARSE_APP_ID;
    const jsKey = import.meta.env.VITE_PARSE_JS_KEY;
    const serverURL = import.meta.env.VITE_PARSE_SERVER_URL;
    
    if (!appId || !jsKey || !serverURL) {
      console.error('Variáveis de ambiente do Parse não encontradas');
      return false;
    }
    
    // Inicializa o Parse
    Parse.initialize(appId, jsKey);
    Parse.serverURL = serverURL;
    
    // Marca como inicializado
    initialized = true;
    
    console.log('Parse inicializado com sucesso:', Parse.applicationId);
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Parse:', error);
    return false;
  }
};

/**
 * Serviço centralizado para operações do Parse
 */
const parseService = {
  // Inicializa o Parse
  initialize: initializeParse,
  
  // Retorna a referência do Parse
  getParseInstance: () => {
    initializeParse();
    return Parse;
  },
  
  // Verifica se está inicializado
  isInitialized: () => {
    return initialized && !!Parse.applicationId;
  },
  
  // Obtém uma classe do Parse
  getClass: (className) => {
    initializeParse();
    return Parse.Object.extend(className);
  },
  
  // Cria uma query para uma classe
  createQuery: (className) => {
    initializeParse();
    const ParseClass = Parse.Object.extend(className);
    return new Parse.Query(ParseClass);
  },
  
  // Salva um objeto no Parse
  saveObject: async (className, data) => {
    initializeParse();
    const ParseClass = Parse.Object.extend(className);
    const object = new ParseClass();
    
    // Define os atributos
    Object.keys(data).forEach(key => {
      object.set(key, data[key]);
    });
    
    return await object.save();
  },
  
  // Salva vários objetos no Parse
  saveObjects: async (className, dataArray) => {
    initializeParse();
    const ParseClass = Parse.Object.extend(className);
    
    const objects = dataArray.map(data => {
      const object = new ParseClass();
      
      // Define os atributos
      Object.keys(data).forEach(key => {
        object.set(key, data[key]);
      });
      
      return object;
    });
    
    return await Parse.Object.saveAll(objects);
  },
  
  // Deleta objetos do Parse
  deleteObjects: async (objects) => {
    initializeParse();
    return await Parse.Object.destroyAll(objects);
  },
  
  // Encontra objetos por uma query
  findObjects: async (className, constraints = {}) => {
    initializeParse();
    const query = parseService.createQuery(className);
    
    // Aplica as restrições
    Object.keys(constraints).forEach(key => {
      if (key === 'equalTo' && typeof constraints[key] === 'object') {
        Object.keys(constraints[key]).forEach(field => {
          query.equalTo(field, constraints[key][field]);
        });
      } else if (key === 'limit' && typeof constraints[key] === 'number') {
        query.limit(constraints[key]);
      }
    });
    
    return await query.find();
  },
  
  // Conta objetos por uma query
  countObjects: async (className, constraints = {}) => {
    initializeParse();
    const query = parseService.createQuery(className);
    
    // Aplica as restrições
    Object.keys(constraints).forEach(key => {
      if (key === 'equalTo' && typeof constraints[key] === 'object') {
        Object.keys(constraints[key]).forEach(field => {
          query.equalTo(field, constraints[key][field]);
        });
      }
    });
    
    return await query.count();
  }
};

// Inicializa o Parse ao importar o serviço
initializeParse();

export default parseService;
