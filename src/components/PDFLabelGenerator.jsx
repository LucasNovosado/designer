// src/components/PDFLabelGenerator.jsx

import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import LabelPreviewComponent from './LabelPreviewComponent';

const PDFLabelGenerator = ({ products }) => {
  const labelsRef = useRef(null);

  const generatePDF = async () => {
    if (!products || products.length === 0 || !labelsRef.current) {
      return;
    }

    try {
      // Configurações do PDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = 210;  // Largura da página A4 em mm
      const pageHeight = 297; // Altura da página A4 em mm
      const margin = 10;      // Margem em mm
      
      // Calcular dimensões para grid 3x3
      const cols = 3;
      const rows = 3;
      const labelWidth = (pageWidth - (margin * 2) - ((cols - 1) * 5)) / cols;
      const labelHeight = labelWidth * 1.5; // Proporção da etiqueta
      
      // Contadores
      let currentProduct = 0;
      let pageNumber = 1;
      
      while (currentProduct < products.length) {
        if (pageNumber > 1) {
          pdf.addPage();
        }
        
        for (let row = 0; row < rows && currentProduct < products.length; row++) {
          for (let col = 0; col < cols && currentProduct < products.length; col++) {
            const label = labelsRef.current.children[currentProduct];
            
            if (label) {
              const x = margin + (col * (labelWidth + 5));
              const y = margin + (row * (labelHeight + 5));
              
              const canvas = await html2canvas(label, { 
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false
              });
              
              const imgData = canvas.toDataURL('image/png');
              pdf.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight, `label_${currentProduct}`, 'FAST');
            }
            
            currentProduct++;
          }
        }
        
        pageNumber++;
      }
      
      // Formatar data para o nome do arquivo
      const date = new Date();
      const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const fileName = `etiquetas_${dateString}.pdf`;
      
      // Salvar o PDF
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  };

  return (
    <div>
      {/* Botão para gerar o PDF */}
      <button onClick={generatePDF} className="generate-pdf-button">
        Gerar PDF com {products.length} etiquetas
      </button>
      
      {/* Container escondido com todas as etiquetas para conversão */}
      <div 
        ref={labelsRef} 
        style={{ position: 'absolute', left: '-9999px', width: '250px' }}
      >
        {products.map((product) => (
          <div key={product.id || Math.random().toString(36).substr(2, 9)}>
            <LabelPreviewComponent product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFLabelGenerator;