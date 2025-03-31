// src/services/priceService.js

import parseService from './parseService';

/**
 * Serviço para gerenciar operações relacionadas à classe Prices
 */
const priceService = {
  /**
   * Busca todos os preços de um determinado estado
   * @param {string} estado - Código do estado (PR, SP, etc.)
   * @returns {Promise<Array>} - Lista de preços
   */
  getPricesByState: async (estado) => {
    try {
      console.log('Buscando preços para o estado:', estado);
      
      const results = await parseService.findObjects('Prices', {
        equalTo: { estado: estado },
        limit: 1000
      });
      
      return results.map(price => price.toJSON());
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
      throw error;
    }
  },

  /**
   * Atualiza os preços de um determinado estado
   * @param {string} estado - Código do estado (PR, SP, etc.)
   * @param {Array} data - Array com os dados de preços
   * @param {Function} progressCallback - Função para atualizar o progresso
   * @returns {Promise<Object>} - Resultado da operação
   */
  updatePrices: async (estado, data, progressCallback = () => {}) => {
    try {
      // Verificar se o Parse está inicializado
      if (!parseService.isInitialized()) {
        throw new Error('Sistema não inicializado corretamente');
      }
      
      // Etapa 1: Deletar preços existentes
      progressCallback('Consultando registros existentes...', 10);
      const existingRecords = await parseService.findObjects('Prices', {
        equalTo: { estado: estado },
        limit: 1000
      });
      
      progressCallback(`Encontrados ${existingRecords.length} registros existentes...`, 20);
      
      if (existingRecords.length > 0) {
        progressCallback(`Deletando ${existingRecords.length} registros existentes...`, 30);
        await parseService.deleteObjects(existingRecords);
      }
      
      // Etapa 2: Inserir novos preços em lotes
      progressCallback(`Preparando para inserir ${data.length} novos registros...`, 40);
      
      // Converter dados conforme o schema esperado pelo Back4App
      const convertedData = data.map(item => ({
        modelo: String(item.modelo),
        // Converter valores numéricos para string conforme esperado pelo schema
        precoAvista: String(item.precoAvista),
        parceladoCheio: String(item.parceladoCheio),
        parcelado12x: String(item.parcelado12x),
        marca: String(item.marca),
        parcelas: String(item.parcelas),
        estado: String(item.estado)
      }));
      
      const batchSize = 50;
      
      // Processando em lotes para evitar sobrecarga
      for (let i = 0; i < convertedData.length; i += batchSize) {
        const batch = convertedData.slice(i, i + batchSize);
        await parseService.saveObjects('Prices', batch);
        
        // Atualizar progresso
        const progress = 40 + Math.floor((i / convertedData.length) * 60);
        progressCallback(`Inseridos ${i + batch.length} de ${convertedData.length} registros...`, progress);
      }
      
      progressCallback('Atualização concluída com sucesso!', 100);
      return { 
        success: true, 
        message: `${convertedData.length} preços atualizados com sucesso.` 
      };
      
    } catch (error) {
      console.error('Erro ao atualizar preços:', error);
      throw error;
    }
  },
  
  /**
   * Obtém estatísticas sobre os preços
   * @returns {Promise<Object>} - Estatísticas
   */
  getPriceStats: async () => {
    try {
      // Verificar se o Parse está inicializado
      if (!parseService.isInitialized()) {
        throw new Error('Sistema não inicializado corretamente');
      }
      
      // Total de registros
      const totalCount = await parseService.countObjects('Prices');
      
      // Contagem por estado
      const prCount = await parseService.countObjects('Prices', {
        equalTo: { estado: 'PR' }
      });
      
      const spCount = await parseService.countObjects('Prices', {
        equalTo: { estado: 'SP' }
      });
      
      // Obter marcas únicas
      const results = await parseService.findObjects('Prices', { limit: 1000 });
      
      // Extrair marcas únicas
      const brands = [...new Set(results.map(item => item.get("marca")))];
      
      return {
        totalPrices: totalCount,
        pricesByState: {
          PR: prCount,
          SP: spCount
        },
        uniqueBrands: brands,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
};

export default priceService;