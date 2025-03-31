// src/services/pdfGeneratorService.js

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Serviço para gerar PDF com etiquetas
 */
const pdfGeneratorService = {
  /**
   * Gera um PDF com etiquetas em formato 3x3 em páginas A4
   * @param {Array} products - Lista de produtos
   * @param {Function} renderEtiqueta - Função para renderizar uma etiqueta
   * @returns {Promise<Blob>} - Blob do PDF gerado
   */
  generateLabelsPDF: async (products, renderEtiqueta) => {
    try {
      // Configurações do PDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = 210;  // Largura da página A4 em mm
      const pageHeight = 297; // Altura da página A4 em mm
      const margin = 10;      // Margem em mm
      
      // Calcular dimensões para grid 3x3
      const cols = 3;
      const rows = 3;
      const labelWidth = (pageWidth - (margin * 2) - ((cols - 1) * margin)) / cols;
      const labelHeight = (pageHeight - (margin * 2) - ((rows - 1) * margin)) / rows;
      
      // Contador para posicionamento
      let currentProduct = 0;
      let pageCount = 1;
      
      while (currentProduct < products.length) {
        // Se não for a primeira página, adicionar nova página
        if (pageCount > 1) {
          pdf.addPage();
        }
        
        // Loop pelas posições na página atual
        for (let row = 0; row < rows && currentProduct < products.length; row++) {
          for (let col = 0; col < cols && currentProduct < products.length; col++) {
            const product = products[currentProduct];
            
            // Calcular posição X e Y para a etiqueta atual
            const x = margin + (col * (labelWidth + margin));
            const y = margin + (row * (labelHeight + margin));
            
            // Criar um elemento temporário para renderizar a etiqueta
            const tempDiv = document.createElement('div');
            tempDiv.style.width = `${labelWidth * 3.78}px`; // Converter mm para px (1mm ≈ 3.78px)
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            // Renderizar a etiqueta usando a função fornecida
            const EtiquetaComponent = renderEtiqueta;
            const etiquetaInstance = <EtiquetaComponent product={product} />;
            
            // Renderizar o componente no elemento temporário
            const root = document.createElement('div');
            tempDiv.appendChild(root);
            
            // Usar ReactDOM para renderizar o componente
            const ReactDOM = require('react-dom');
            ReactDOM.render(etiquetaInstance, root);
            
            // Converter a etiqueta renderizada em imagem
            try {
              const canvas = await html2canvas(root.firstChild, {
                scale: 2, // Melhor qualidade
                logging: false,
                useCORS: true,
                allowTaint: true
              });
              
              // Adicionar a imagem ao PDF
              const imgData = canvas.toDataURL('image/png');
              pdf.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight, `label_${currentProduct}`, 'FAST');
              
            } catch (renderError) {
              console.error('Erro ao renderizar etiqueta:', renderError);
            }
            
            // Limpar elemento temporário
            document.body.removeChild(tempDiv);
            
            // Incrementar contador de produtos
            currentProduct++;
          }
        }
        
        pageCount++;
      }
      
      // Salvar o PDF
      const pdfBlob = pdf.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  },
  
  /**
   * Salva o PDF gerado
   * @param {Blob} pdfBlob - Blob do PDF
   * @param {string} filename - Nome do arquivo
   */
  savePDF: (pdfBlob, filename = 'etiquetas.pdf') => {
    // Criar URL para o blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Criar link de download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Adicionar o link ao documento e clicar nele
    document.body.appendChild(link);
    link.click();
    
    // Limpar recursos
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
};

export default pdfGeneratorService;