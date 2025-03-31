// src/components/PriceUploadComponent.jsx

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './PriceUploadComponent.css';
import parseService from '../services/parseService';
import priceService from '../services/priceService';

const PriceUploadComponent = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isParseReady, setIsParseReady] = useState(false);

  // Verificar se o Parse está inicializado ao montar o componente
  useEffect(() => {
    const checkParse = () => {
      const initialized = parseService.isInitialized();
      console.log('Parse inicializado?', initialized);
      setIsParseReady(initialized);
      
      // Se não estiver inicializado, tentar inicializar e verificar novamente após 1 segundo
      if (!initialized) {
        parseService.initialize();
        setTimeout(checkParse, 1000);
      }
    };
    
    checkParse();
  }, []);

  const handleStateSelection = (event) => {
    setSelectedState(event.target.value);
  };

  const handleFileUpload = async (event) => {
    // Verificar novamente se o Parse está inicializado
    if (!parseService.isInitialized()) {
      alert('Sistema não inicializado corretamente. Tente recarregar a página.');
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    if (!selectedState) {
      alert('Por favor, selecione um estado antes de fazer upload.');
      return;
    }

    setIsUploading(true);
    setUploadState('Processando arquivo...');
    setUploadProgress(10);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Array para armazenar todos os dados extraídos de todas as abas
        const allSheetData = [];
        
        // Processar cada aba da planilha
        const totalSheets = workbook.SheetNames.length;
        
        for (let i = 0; i < totalSheets; i++) {
          const sheetName = workbook.SheetNames[i];
          setUploadState(`Processando marca: ${sheetName} (${i + 1}/${totalSheets})`);
          setUploadProgress(10 + Math.floor((i / totalSheets) * 40));
          
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
              const priceData = {
                modelo: jsonData[row][0],
                precoAvista: parseFloat(jsonData[row][1]) || 0,
                parceladoCheio: parseFloat(jsonData[row][6]) || 0, // Coluna G é índice 6
                parcelado12x: parseFloat(jsonData[row][7]) || 0,   // Coluna H é índice 7
                marca: marca,
                parcelas: "12", // Valor fixo conforme solicitado
                estado: selectedState // Adicionar o estado selecionado
              };
              
              allSheetData.push(priceData);
            }
          }
        }
        
        setUploadState(`Extração concluída. Encontrados ${allSheetData.length} produtos. Iniciando atualização...`);
        setUploadProgress(50);
        
        try {
          // Usar o serviço de preços para atualizar todos os registros
          await priceService.updatePrices(
            selectedState, 
            allSheetData, // Enviar todos os registros sem limitar
            (message, progress) => {
              setUploadState(message);
              setUploadProgress(progress);
            }
          );
          
          // Limpar estados após sucesso
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadState('');
          }, 3000);
          
        } catch (uploadError) {
          console.error("Erro ao enviar dados:", uploadError);
          setUploadState(`Erro ao atualizar preços: ${uploadError.message}`);
          setUploadProgress(0);
          setIsUploading(false);
        }
        
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        setUploadState(`Erro ao processar arquivo: ${error.message}`);
        setIsUploading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="price-upload-container">
      <div className="upload-content">
        {!isParseReady && (
          <div style={{
            marginBottom: '10px',
            padding: '8px',
            backgroundColor: '#4d3434',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#e0e0e0'
          }}>
            <strong>Sistema não inicializado:</strong> Aguarde ou recarregue a página.
          </div>
        )}
      
        <div className="state-selector">
          <label htmlFor="state-select">Estado:</label>
          <select 
            id="state-select" 
            value={selectedState} 
            onChange={handleStateSelection}
            disabled={isUploading || !isParseReady}
          >
            <option value="">Selecione...</option>
            <option value="PR">Paraná</option>
            <option value="SP">São Paulo</option>
          </select>
        </div>
        
        <div className="upload-button-container">
          <label htmlFor="file-upload" className={`upload-button ${isUploading || !isParseReady ? 'disabled' : ''}`}>
            <i className="excel-icon"></i>
            Inserir Tabela de Preço
          </label>
          <input 
            id="file-upload" 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            disabled={isUploading || !selectedState || !isParseReady}
          />
        </div>
        
        {isUploading && (
          <div className="upload-status">
            <p>{uploadState}</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceUploadComponent;