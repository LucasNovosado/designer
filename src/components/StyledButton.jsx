// src/components/StyledButton.jsx

import React from 'react';
import './StyledButton.css';

/**
 * Componente de botão estilizado para a aplicação
 * @param {Object} props - Propriedades do componente
 * @param {string} props.type - Tipo do botão (primary, secondary, danger)
 * @param {string} props.size - Tamanho do botão (small, medium, large)
 * @param {string} props.icon - Classe do ícone (opcional)
 * @param {boolean} props.fullWidth - Se o botão deve ocupar 100% da largura
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {Function} props.onClick - Função a ser executada ao clicar no botão
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @returns {JSX.Element} - Componente de botão
 */
const StyledButton = ({ 
  type = 'primary', 
  size = 'medium', 
  icon,
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  ...rest
}) => {
  // Construir classes CSS
  const buttonClass = `styled-button ${type} ${size} ${fullWidth ? 'full-width' : ''} ${disabled ? 'disabled' : ''}`;
  
  return (
    <button 
      className={buttonClass} 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && <i className={icon}></i>}
      {children}
    </button>
  );
};

export default StyledButton;