// src/utils/formatPrice.js

/**
 * Formata valores monetários para exibição
 * @param {string|number} value - Valor a ser formatado 
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} - Valor formatado
 */
export const formatPrice = (value, decimals = 2) => {
  // Se o valor for undefined ou null, retorna traço
  if (value === undefined || value === null) return '-';
  
  // Converte para número se for string
  const numberValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  
  // Verifica se é um número válido
  if (isNaN(numberValue)) return '-';
  
  // Formata o número com a quantidade de casas decimais especificada
  return numberValue.toFixed(decimals).replace('.', ',');
};

/**
 * Formata valores monetários com prefixo R$
 * @param {string|number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} - Valor formatado com prefixo R$
 */
export const formatCurrency = (value, decimals = 2) => {
  const formattedValue = formatPrice(value, decimals);
  
  // Se o valor não foi formatado corretamente, não adiciona o prefixo
  if (formattedValue === '-') return formattedValue;
  
  return `R$ ${formattedValue}`;
};

export default formatCurrency;