// src/utils/modelFormatter.js

/**
 * Verifica se dois modelos diferem apenas pela orientação do polo (D ou E)
 * @param {string} modelA - Primeiro nome de modelo
 * @param {string} modelB - Segundo nome de modelo
 * @returns {boolean} - Verdadeiro se os modelos diferirem apenas pela orientação D/E
 */
const areModelsSimilar = (modelA, modelB) => {
    if (!modelA || !modelB) return false;
    
    // Extrair o nome do modelo e o sufixo (parênteses ou palavras após espaço)
    const parseModelName = (model) => {
      const modelString = model.toString().toUpperCase();
      
      // Primeiro verifica se tem parênteses
      const parenMatch = modelString.match(/^(.*?)(\s*\([^)]*\))?$/);
      if (parenMatch && parenMatch[2]) {
        return {
          base: parenMatch[1].trim(), // Nome base do modelo (sem o sufixo)
          suffix: parenMatch[2] // Sufixo com parênteses
        };
      }
      
      // Se não tem parênteses, verifica se tem palavras separadas por espaço
      const spaceMatch = modelString.match(/^(\S+)(\s+.+)?$/);
      if (spaceMatch) {
        return {
          base: spaceMatch[1], // Primeira palavra como base
          suffix: spaceMatch[2] || '' // Resto como sufixo
        };
      }
      
      // Fallback
      return { base: modelString, suffix: '' };
    };
    
    const modelAInfo = parseModelName(modelA);
    const modelBInfo = parseModelName(modelB);
    
    // Se os sufixos são diferentes, não são modelos similares
    if (modelAInfo.suffix !== modelBInfo.suffix) {
      return false;
    }
    
    // Obter a parte base
    const aBase = modelAInfo.base;
    const bBase = modelBInfo.base;
    
    // Verificar se um termina com D e outro com E
    if ((aBase.endsWith('D') && bBase.endsWith('E')) || 
        (aBase.endsWith('E') && bBase.endsWith('D'))) {
      
      // Remove o último caractere e compara o restante
      const aCore = aBase.slice(0, -1);
      const bCore = bBase.slice(0, -1);
      
      return aCore === bCore;
    }
    
    return false;
  };
  
  /**
   * Formata um nome de modelo para exibição, agrupando variantes D/E
   * @param {string} model - Nome do modelo a ser formatado
   * @returns {string} - Modelo formatado
   */
  const formatSingleModel = (model) => {
    if (!model) return '';
    
    // Extrair o nome do modelo e o sufixo
    const modelString = model.toString().toUpperCase();
    
    // Primeiro verifica se tem parênteses
    const parenMatch = modelString.match(/^(.*?)(\s*\([^)]*\))?$/);
    if (parenMatch && parenMatch[2]) {
      const base = parenMatch[1].trim();
      const suffix = parenMatch[2];
      
      // Se o modelo termina com D ou E, remove o último caractere
      if (base.endsWith('D') || base.endsWith('E')) {
        return base.slice(0, -1) + suffix;
      }
      
      return modelString;
    }
    
    // Se não tem parênteses, verifica se tem palavras separadas por espaço
    const spaceMatch = modelString.match(/^(\S+)(\s+.+)?$/);
    if (spaceMatch) {
      const base = spaceMatch[1];
      const suffix = spaceMatch[2] || '';
      
      // Se o modelo termina com D ou E, remove o último caractere
      if (base.endsWith('D') || base.endsWith('E')) {
        return base.slice(0, -1) + suffix;
      }
    }
    
    return modelString;
  };
  
  /**
   * Agrupa modelos similares que diferem apenas pela orientação do polo (D ou E)
   * @param {Array} models - Array de objetos contendo modelos
   * @param {string} modelKey - Nome da propriedade que contém o nome do modelo
   * @param {string} priceKey - Nome da propriedade que contém o preço para comparação (opcional)
   * @returns {Array} - Array de modelos agrupados
   */
  const groupSimilarModels = (models, modelKey = 'modelo', priceKey = null) => {
    if (!models || !Array.isArray(models) || models.length === 0) {
      return [];
    }
    
    const result = [];
    const processedIndexes = new Set();
    
    const parseModelName = (model) => {
      const modelString = model.toString().toUpperCase();
      
      // Primeiro verifica se tem parênteses
      const parenMatch = modelString.match(/^(.*?)(\s*\([^)]*\))?$/);
      if (parenMatch && parenMatch[2]) {
        return {
          base: parenMatch[1].trim(),
          suffix: parenMatch[2]
        };
      }
      
      // Se não tem parênteses, verifica se tem palavras separadas por espaço
      const spaceMatch = modelString.match(/^(\S+)(\s+.+)?$/);
      if (spaceMatch) {
        return {
          base: spaceMatch[1],
          suffix: spaceMatch[2] || ''
        };
      }
      
      return { base: modelString, suffix: '' };
    };
    
    for (let i = 0; i < models.length; i++) {
      // Pular itens já processados
      if (processedIndexes.has(i)) continue;
      
      const currentModel = models[i];
      const currentModelName = currentModel[modelKey];
      
      // Encontra modelos similares
      const similarModels = [];
      const similarIndexes = [];
      
      for (let j = i + 1; j < models.length; j++) {
        // Pular itens já processados
        if (processedIndexes.has(j)) continue;
        
        const compareModel = models[j];
        const compareModelName = compareModel[modelKey];
        
        // Verificar se são similares e, se priceKey for especificado, se têm o mesmo preço
        const areSimilar = areModelsSimilar(currentModelName, compareModelName);
        const haveSamePrice = !priceKey || 
          (parseFloat(currentModel[priceKey]) === parseFloat(compareModel[priceKey]));
        
        if (areSimilar && haveSamePrice) {
          similarModels.push(compareModel);
          similarIndexes.push(j);
        }
      }
      
      // Criar objeto com modelo agrupado
      const groupedModel = { ...currentModel };
      
      if (similarModels.length > 0) {
        const currentModelInfo = parseModelName(currentModelName);
        
        // Determinar se tem variantes D e E
        let hasD = currentModelInfo.base.endsWith('D');
        let hasE = currentModelInfo.base.endsWith('E');
        
        for (const model of similarModels) {
          const modelInfo = parseModelName(model[modelKey]);
          hasD = hasD || modelInfo.base.endsWith('D');
          hasE = hasE || modelInfo.base.endsWith('E');
        }
        
        // Formatar o nome do modelo
        if (hasD && hasE) {
          const baseModel = currentModelInfo.base.slice(0, -1); // Remove D ou E
          groupedModel[modelKey] = `${baseModel} (D/E)${currentModelInfo.suffix}`;
        } else {
          // Se não tem ambas as variantes, mantém como está
          groupedModel[modelKey] = currentModelName;
        }
        
        // Marcar todos os modelos similares como processados
        similarIndexes.forEach(index => processedIndexes.add(index));
      }
      
      result.push(groupedModel);
      processedIndexes.add(i);
    }
    
    return result;
  };
  
  /**
   * Formata um array de nomes de modelos para exibição, agrupando variantes D/E
   * @param {Array<string>} models - Array de nomes de modelos
   * @returns {Array<string>} - Array de modelos formatados
   */
  const formatModelArray = (models) => {
    if (!models || !Array.isArray(models) || models.length === 0) {
      return [];
    }
    
    const modelObjects = models.map(model => ({ modelo: model }));
    const groupedModels = groupSimilarModels(modelObjects);
    
    return groupedModels.map(item => item.modelo);
  };
  
  export {
    areModelsSimilar,
    formatSingleModel,
    groupSimilarModels,
    formatModelArray
  };
  
  export default groupSimilarModels;