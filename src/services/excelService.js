// src/services/excelService.js

import * as XLSX from 'xlsx';
import Parse from 'parse';

/**
 * Serviço para processamento de arquivos Excel e integração com Back4App
 */
class ExcelService {
  /**
   * Processa um arquivo Excel de tabela de preços
   * @param {File} file - Arquivo Excel para processar
   * @param {string} estado - Estado (PR ou SP)
   * @param {Function} progressCallback - Callback para atualizar progresso
   * @returns {Promise<Array>} - Array com os dados extraídos
   */
  static async processExcelFile(file, estado, progressCallback = () => {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          progressCallback('Lendo arquivo...', 5);
          
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          progressCallback('Analisando planilha...', 10);
          
          // Array para armazenar todos os dados extraídos
          const allSheetData = [];
          
          // Processar cada aba da planilha
          const totalSheets = workbook.SheetNames.length;
          
          for (let i = 0; i < totalSheets; i++) {
            const sheetName = workbook.SheetNames[i];
            progressCallback(
              `Processando marca: ${sheetName}`, 
              10 + Math.floor((i / totalSheets) * 70)
            );
            
            const sheet = workbook.Sheets[sheetName];
            
            // Pular abas vazias ou irrelevantes
            if (sheetName.trim() === "") continue;
            
            // Converter planilha para JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            
            // Extrair o nome da marca das primeiras linhas
            const marca = jsonData[0][0] || jsonData[1][0] || sheetName;
            
            // Começar a partir da linha 5 (índice 4 em base zero)
            for (let row = 4; row < jsonData.length; row++) {
              // Verificar se a linha tem um modelo válido
              if (jsonData[row][0] && jsonData[row][0].toString().trim() !== "") {
                // Valores numéricos podem estar como string, então tentamos converter
                const precoAvista = this.parseNumberValue(jsonData[row][1]);
                const parceladoCheio = this.parseNumberValue(jsonData[row][6]); // Coluna G
                const parcelado12x = this.parseNumberValue(jsonData[row][7]);   // Coluna H
                
                if (precoAvista || parceladoCheio || parcelado12x) {
                  const priceData = {
                    modelo: jsonData[row][0],
                    precoAvista: precoAvista,
                    parceladoCheio: parceladoCheio,
                    parcelado12x: parcelado12x,
                    marca: marca,
                    parcelas: "12", // Valor fixo conforme solicitado
                    estado: estado
                  };
                  
                  allSheetData.push(priceData);
                }
              }
            }
          }
          
          progressCallback(`Extração concluída. ${allSheetData.length} produtos encontrados.`, 90);
          resolve(allSheetData);
          
        } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Atualiza os preços no banco de dados Parse
   * @param {Array} priceData - Array com os dados de preço
   * @param {string} estado - Estado (PR ou SP)
   * @param {Function} progressCallback - Callback para atualizar progresso
   * @returns {Promise<void>}
   */
  static async updatePricesInDatabase(priceData, estado, progressCallback = () => {}) {
    try {
      // Classe para armazenar preços no Parse
      const Prices = Parse.Object.extend("Prices");
      
      // Primeiro, buscamos todos os registros existentes do estado selecionado para deletar
      progressCallback('Consultando registros existentes...', 0);
      const query = new Parse.Query(Prices);
      query.equalTo("estado", estado);
      query.limit(10000); // Limite máximo para garantir que pegamos todos
      const existingRecords = await query.find({ useMasterKey: true });
      
      // Deletar registros existentes em lotes
      if (existingRecords.length > 0) {
        progressCallback(`Removendo ${existingRecords.length} registros antigos...`, 10);
        
        const batchSize = 100;
        for (let i = 0; i < existingRecords.length; i += batchSize) {
          const batch = existingRecords.slice(i, i + batchSize);
          await Parse.Object.destroyAll(batch, { useMasterKey: true });
          
          const progress = 10 + Math.floor((i / existingRecords.length) * 40);
          progressCallback(`Removendo registros antigos: ${i + batch.length}/${existingRecords.length}`, progress);
        }
      }
      
      // Agora inserimos os novos registros em lotes
      progressCallback(`Inserindo ${priceData.length} novos registros...`, 50);
      
      const batchSize = 100;
      const totalBatches = Math.ceil(priceData.length / batchSize);
      
      for (let i = 0; i < priceData.length; i += batchSize) {
        const batch = priceData.slice(i, i + batchSize).map(data => {
          const priceObj = new Prices();
          
          // Configurar todos os campos
          Object.keys(data).forEach(key => {
            priceObj.set(key, data[key]);
          });
          
          return priceObj;
        });
        
        await Parse.Object.saveAll(batch, { useMasterKey: true });
        
        const currentBatch = Math.floor(i / batchSize) + 1;
        const progress = 50 + Math.floor((currentBatch / totalBatches) * 50);
        progressCallback(`Inserindo registros: ${i + batch.length}/${priceData.length}`, progress);
      }
      
      progressCallback('Atualização concluída com sucesso!', 100);
      
    } catch (error) {
      console.error("Erro ao atualizar banco de dados:", error);
      throw error;
    }
  }
  
  /**
   * Converte um valor numérico da planilha
   * @param {any} value - Valor a ser convertido
   * @returns {number} - Número convertido ou zero
   */
  static parseNumberValue(value) {
    if (value === "" || value === undefined || value === null) {
      return 0;
    }
    
    // Se já for um número, retorna ele mesmo
    if (typeof value === 'number') {
      return value;
    }
    
    // Tenta converter string para número
    const strValue = String(value).replace(',', '.');
    const numValue = parseFloat(strValue);
    
    return isNaN(numValue) ? 0 : numValue;
  }
  
  /**
   * Verifica se o arquivo é uma planilha válida
   * @param {File} file - Arquivo para verificar
   * @returns {boolean} - Se é uma planilha válida
   */
  static isValidExcelFile(file) {
    if (!file) return false;
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  }
  
  /**
   * Extrai informações básicas sobre a planilha
   * @param {File} file - Arquivo Excel
   * @returns {Promise<Object>} - Informações sobre a planilha
   */
  static async getExcelSummary(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const summary = {
            totalSheets: workbook.SheetNames.length,
            sheetNames: workbook.SheetNames,
            fileName: file.name,
            fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          };
          
          resolve(summary);
          
        } catch (error) {
          console.error("Erro ao analisar planilha:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
}

export default ExcelService;