// src/services/parseService.js
import Parse from 'parse';

/**
 * Serviço centralizado para operações do Parse
 */
const parseService = {
  // Verifica se está inicializado
  isInitialized: () => {
    const initialized = !!Parse.applicationId;
    console.log('Parse inicializado?', initialized);
    return initialized;
  },
  
  // Inicializa o Parse (agora apenas verifica - não inicializa)
  initialize: () => {
    // Verificar apenas, não inicializar - deixamos isso para o ParseContext
    const initialized = !!Parse.applicationId;
    console.log('Verificando inicialização do Parse em parseService:', initialized);
    return initialized;
  },
  
  // Retorna a referência do Parse
  getParseInstance: () => {
    return Parse;
  },
  
  // Obtém uma classe do Parse
  getClass: (className) => {
    if (!Parse.applicationId) {
      console.error(`Parse não inicializado ao tentar obter classe ${className}`);
      throw new Error('Sistema não inicializado corretamente');
    }
    return Parse.Object.extend(className);
  },
  
  // Cria uma query para uma classe
  createQuery: (className) => {
    if (!Parse.applicationId) {
      console.error(`Parse não inicializado ao tentar criar query para ${className}`);
      throw new Error('Sistema não inicializado corretamente');
    }
    const ParseClass = Parse.Object.extend(className);
    return new Parse.Query(ParseClass);
  },
  
  // Salva um objeto no Parse
  saveObject: async (className, data) => {
    if (!Parse.applicationId) {
      console.error(`Parse não inicializado ao tentar salvar objeto em ${className}`);
      throw new Error('Sistema não inicializado corretamente');
    }
    
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
    if (!Parse.applicationId) {
      console.error(`Parse não inicializado ao tentar salvar objetos em ${className}`);
      throw new Error('Sistema não inicializado corretamente');
    }
    
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
    if (!Parse.applicationId) {
      console.error('Parse não inicializado ao tentar deletar objetos');
      throw new Error('Sistema não inicializado corretamente');
    }
    
    return await Parse.Object.destroyAll(objects);
  },
  
  // Encontra objetos por uma query
  findObjects: async (className, constraints = {}) => {
    if (!Parse.applicationId) {
      console.error(`Parse não inicializado ao tentar buscar objetos em ${className}`);
      throw new Error('Sistema não inicializado corretamente');
    }
    
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
    if (!Parse.applicationId) {
      console.error(`Parse não inicializado ao tentar contar objetos em ${className}`);
      throw new Error('Sistema não inicializado corretamente');
    }
    
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

export default parseService;
