// src/components/LabelPreviewComponent.jsx

import React from 'react';
import './LabelPreviewComponent.css';
// Importar a imagem diretamente
import batsLogo from '../assets/logos/bats.png';
import haizerLogo from '../assets/logos/haizer.png';
import heliarLogo from '../assets/logos/heliar.png';
import imparLogo from '../assets/logos/impar.png';
import powerPlusLogo from '../assets/logos/power_plus.png';
import unicaLogo from '../assets/logos/unica.png';

/**
 * Componente que exibe um preview da etiqueta para o produto selecionado
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.product - Dados do produto selecionado
 * @param {string} props.product.modelo - Modelo do produto
 * @param {string} props.product.marca - Marca do produto
 * @param {string} props.product.precoAvista - Preço à vista
 * @param {string} props.product.parceladoCheio - Valor total parcelado
 * @param {string} props.product.parcelado12x - Valor da parcela em 12x
 */
const LabelPreviewComponent = ({ product }) => {
  if (!product) return null;

  // Formatar os valores para exibição
  const formatPrice = (price) => {
    // Converter para número caso seja string
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : price;
    
    // Formatar com 2 casas decimais
    const formatted = numPrice.toFixed(2);
    
    // Separar parte inteira e decimal
    const [intPart, decPart] = formatted.split('.');
    
    return {
      intPart,
      decPart
    };
  };

  // Formatar preços
  const precoAvista = formatPrice(product.precoAvista);
  const parceladoCheio = formatPrice(product.parceladoCheio);
  const precoParcelado = formatPrice(product.parcelado12x);
  
  // Determinar a classe para o tamanho do valor à vista com base no número de dígitos
  const getValueSizeClass = (value) => {
    const numDigits = value.length;
    return `digits-${numDigits}`;
  };

  // Verificar qual logo deve ser exibido com base na marca (insensível a maiúsculas/minúsculas)
  const getLogoForBrand = (marca) => {
    const marcaLower = marca.toLowerCase();
    
    // Mapeamento de marcas para seus respectivos logos
    if (marcaLower === 'bats') return { logo: batsLogo, alt: 'BATS Logo' };
    if (marcaLower === 'haizer' || marcaLower.includes('haizer')) return { logo: haizerLogo, alt: 'Haizer Logo' };
    if (marcaLower === 'heliar' || marcaLower.includes('heliar')) return { logo: heliarLogo, alt: 'Heliar Logo' };
    if (marcaLower === 'impar' || marcaLower === 'ímpar') return { logo: imparLogo, alt: 'Ímpar Logo' };
    if (marcaLower === 'power' || marcaLower.includes('power')) return { logo: powerPlusLogo, alt: 'Power Plus Logo' };
    if (marcaLower === 'unica' || marcaLower === 'única') return { logo: unicaLogo, alt: 'Única Logo' };
    
    // Se não encontrar uma correspondência, retorna null
    return null;
  };
  
  // Obter o logo da marca
  const brandLogo = getLogoForBrand(product.marca);
  const hasLogo = brandLogo !== null;

  return (
    <div className="label-preview-container">
      <h3>Preview da Etiqueta</h3>
      
      <div className="label-preview">
        {/* Marca e modelo */}
        <div className="label-brand">
          {hasLogo ? (
            <div className="brand-logo-container">
              <img src={brandLogo.logo} alt={brandLogo.alt} className="brand-logo" />
            </div>
          ) : (
            <span className="brand-text">{product.marca}</span>
          )}
          <div className="model-container">
            <span className="model-specs">{product.modelo}</span>
          </div>
        </div>
        
        <div className="label-price-container">
          {/* Tag "POR APENAS" */}
          <div className="label-price-tag">
            <div className="price-tag-text">POR APENAS</div>
          </div>
          
          {/* Preço parcelado total */}
          <div className="label-price">
            <span className="currency">R$</span>
            <span className="price-value">{parceladoCheio.intPart}</span>
            <span className="price-cents">,{parceladoCheio.decPart}</span>
          </div>
          
          {/* Tag "EM ATÉ 12x" */}
          <div className="label-installments-tag">
            <div className="installments-tag-text">EM ATÉ 12x:</div>
          </div>
          
          {/* Valor da parcela */}
          <div className="label-installments">
            <span className="currency">R$</span>
            <span className="installments-value">{precoParcelado.intPart}</span>
            <span className="installments-cents">,{precoParcelado.decPart}</span>
          </div>
        </div>
        
        {/* Preço à vista com classe dinâmica baseada no número de dígitos */}
        <div className="label-cash-price">
          <div className="cash-price-or">OU</div>
          <div className="cash-price-value">
            <span className="currency">R$</span>
            <span className={`value ${getValueSizeClass(precoAvista.intPart)}`}>
              {precoAvista.intPart}
            </span>
            <span className="cents">,00</span>
          </div>
          <div className="cash-price-text">VALOR À VISTA</div>
        </div>
        
        <div className="label-footer">
          <div className="label-footer-text">VALORES À BASE DE TROCA</div>
        </div>
      </div>
    </div>
  );
};

export default LabelPreviewComponent;