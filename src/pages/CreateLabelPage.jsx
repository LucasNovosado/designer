// src/pages/CreateLabelPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import parseService from '../services/parseService';
import StyledButton from '../components/StyledButton';
import LabelPreviewComponent from '../components/LabelPreviewComponent';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { groupSimilarModels } from '../utils/modelFormatter';
import './CreateLabelPage.css';

// Função de formatação de preço
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '-';
  
  const numberValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(numberValue)) return '-';
  
  return `R$ ${numberValue.toFixed(2).replace('.', ',')}`;
};

const CreateLabelPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prices, setPrices] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [groupModels, setGroupModels] = useState(true); // Novo estado para controlar o agrupamento
  const labelsRef = useRef(null);
  const navigate = useNavigate();

  // Verificar autenticação
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  // Carregar marcas disponíveis
  const loadBrands = async (estado) => {
    try {
      setLoading(true);
      
      // Busca os preços do estado selecionado
      const query = parseService.createQuery('Prices');
      query.equalTo('estado', estado);
      query.limit(1000);
      const results = await query.find();
      
      // Salva os preços
      const pricesData = results.map(price => ({
        id: price.id,
        modelo: price.get('modelo'),
        precoAvista: price.get('precoAvista'),
        parceladoCheio: price.get('parceladoCheio'),
        parcelado12x: price.get('parcelado12x'),
        marca: price.get('marca'),
        parcelas: price.get('parcelas'),
        estado: price.get('estado')
      }));
      setPrices(pricesData);
      
      // Extrai as marcas únicas
      const uniqueBrands = [...new Set(pricesData.map(item => item.marca))].sort();
      setBrands(uniqueBrands);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
      setLoading(false);
    }
  };

  // Filtra os preços quando a marca é selecionada
  useEffect(() => {
    if (selectedBrand && prices.length > 0) {
      const filtered = prices.filter(price => price.marca === selectedBrand);
      
      // Decide se aplica o agrupamento ou não
      const productsToShow = groupModels ? 
        groupSimilarModels(filtered, 'modelo', 'precoAvista') : 
        filtered;
      
      setFilteredPrices(productsToShow);
      
      // Seleciona todos os produtos por padrão
      setSelectedProducts(productsToShow.map(product => product.id));
      
      // Seleciona o primeiro produto para o preview
      if (productsToShow.length > 0) {
        setSelectedProduct(productsToShow[0]);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setFilteredPrices([]);
      setSelectedProducts([]);
      setSelectedProduct(null);
    }
  }, [selectedBrand, prices, groupModels]);

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedBrand('');
    setFilteredPrices([]);
    setSelectedProducts([]);
    setSelectedProduct(null);
    
    if (state) {
      loadBrands(state);
    } else {
      setBrands([]);
      setPrices([]);
    }
  };

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
  };

  // Novo handler para o checkbox de agrupamento
  const handleGroupModelsChange = (e) => {
    setGroupModels(e.target.checked);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleToggleProductSelection = (productId) => {
    setSelectedProducts(prevSelected => {
      if (prevSelected.includes(productId)) {
        // Se o produto já está selecionado, remove-o
        return prevSelected.filter(id => id !== productId);
      } else {
        // Se o produto não está selecionado, adiciona-o
        return [...prevSelected, productId];
      }
    });
  };

  const handleSelectAllProducts = () => {
    setSelectedProducts(filteredPrices.map(product => product.id));
  };

  const handleDeselectAllProducts = () => {
    setSelectedProducts([]);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const generatePDF = async () => {
    if (selectedProducts.length === 0) {
      alert('Selecione pelo menos um produto para gerar etiquetas');
      return;
    }
    
    setGenerating(true);
    
    try {
      // Obter apenas os produtos selecionados
      const productsToGenerate = filteredPrices.filter(product => 
        selectedProducts.includes(product.id)
      );
      
      // Configurações do PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = 210; // Largura A4 em mm
      const pageHeight = 297; // Altura A4 em mm
      const margin = 10; // Margem em mm
      
      // Definir dimensões das etiquetas
      const cols = 3;
      const rows = 3;
      const labelWidth = ((pageWidth - (margin * 2)) / cols) - 5; // Largura com consideração de espaço entre etiquetas
      const labelHeight = ((pageHeight - (margin * 2)) / rows) - 5; // Altura com consideração de espaço entre etiquetas
      
      // Contador de produtos e páginas
      let currentProduct = 0;
      let currentPage = 1;
      
      // Temporariamente criar um elemento para cada etiqueta
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.top = '-9999px';
      tempElement.style.left = '-9999px';
      document.body.appendChild(tempElement);
      
      // Formatar a data para o nome do arquivo
      const today = new Date();
      const dateStr = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;
      
      // Loop pelas páginas necessárias
      while (currentProduct < productsToGenerate.length) {
        // Loop pelas linhas na página atual
        for (let row = 0; row < rows && currentProduct < productsToGenerate.length; row++) {
          // Loop pelas colunas na linha atual
          for (let col = 0; col < cols && currentProduct < productsToGenerate.length; col++) {
            const product = productsToGenerate[currentProduct];
            
            // Calcular posição X e Y para a etiqueta atual
            const x = margin + (col * (labelWidth + 5));
            const y = margin + (row * (labelHeight + 5));
            
            // Renderizar a etiqueta para o produto atual
            tempElement.innerHTML = '';
            
            // Clonar o componente de preview
            const previewElement = document.querySelector('.label-preview');
            if (previewElement) {
              const clonedPreview = previewElement.cloneNode(true);
              
              // Atualizar os dados no clone
              // Tentar atualizar o modelo
              try {
                const modelElement = clonedPreview.querySelector('.model-specs');
                if (modelElement) {
                  modelElement.textContent = product.modelo;
                }
                
                // Formatação dos preços (mesmo formato do componente original)
                const formatPrice = (price) => {
                  const numPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : price;
                  const formatted = numPrice.toFixed(2);
                  return {
                    intPart: formatted.split('.')[0],
                    decPart: formatted.split('.')[1]
                  };
                };
                
                const precoParcelado = formatPrice(product.parceladoCheio);
                const precoVista = formatPrice(product.precoAvista);
                const parcela = formatPrice(product.parcelado12x);
                
                // Atualizar valor parcelado
                const parceladoIntElement = clonedPreview.querySelector('.price-value');
                const parceladoDecElement = clonedPreview.querySelector('.price-cents');
                if (parceladoIntElement) {
                  parceladoIntElement.textContent = precoParcelado.intPart;
                }
                if (parceladoDecElement) {
                  parceladoDecElement.textContent = `,${precoParcelado.decPart}`;
                }
                
                // Atualizar valor da parcela
                const parcelaIntElement = clonedPreview.querySelector('.installments-value');
                const parcelaDecElement = clonedPreview.querySelector('.installments-cents');
                if (parcelaIntElement) {
                  parcelaIntElement.textContent = parcela.intPart;
                }
                if (parcelaDecElement) {
                  parcelaDecElement.textContent = `,${parcela.decPart}`;
                }
                
                // Atualizar preço à vista
                const vistaElement = clonedPreview.querySelector('.cash-price-value .value');
                if (vistaElement) {
                  vistaElement.textContent = precoVista.intPart;
                  vistaElement.className = `value digits-${precoVista.intPart.length}`;
                }
              } catch (err) {
                console.error('Erro ao atualizar dados no clone:', err);
              }
              
              tempElement.appendChild(clonedPreview);
              
              // Converter o elemento para imagem
              const canvas = await html2canvas(clonedPreview, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null
              });
              
              // Adicionar a imagem ao PDF
              const imgData = canvas.toDataURL('image/png');
              pdf.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight, undefined, 'FAST');
            }
            
            // Avançar para o próximo produto
            currentProduct++;
          }
        }
        
        // Se ainda houver produtos para processar, adicionar nova página
        if (currentProduct < productsToGenerate.length) {
          pdf.addPage();
          currentPage++;
        }
      }
      
      // Limpar elemento temporário
      document.body.removeChild(tempElement);
      
      // Salvar o PDF
      pdf.save(`Etiquetas_${selectedBrand}_${dateStr}.pdf`);
      
      setGenerating(false);
      alert(`PDF com ${productsToGenerate.length} etiquetas gerado com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setGenerating(false);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return <div className="loading">Carregando dados...</div>;
  }

  return (
    <div className="create-label-container">
      <header className="create-label-header">
        <h1>Geração de Etiquetas</h1>
        <StyledButton 
          type="secondary" 
          size="medium" 
          onClick={handleBack}
        >
          Voltar ao Dashboard
        </StyledButton>
      </header>
      
      <div className="create-label-content">
        <div className="welcome-card">
          <h2>Criar Etiquetas de Preço</h2>
          <p>Selecione o estado e a marca para gerar etiquetas de preço para impressão.</p>
        </div>
        
        <div className="dashboard-section">
          <div className="dashboard-card filter-card">
            <h3>Filtrar Produtos</h3>
            
            <div className="filter-container">
              <div className="filter-group">
                <label className="filter-label">Estado:</label>
                <select 
                  className="filter-select"
                  value={selectedState}
                  onChange={handleStateChange}
                  disabled={generating}
                >
                  <option value="">Selecione o estado</option>
                  <option value="PR">Paraná</option>
                  <option value="SP">São Paulo</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">Marca:</label>
                <select 
                  className="filter-select"
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  disabled={!selectedState || brands.length === 0 || generating}
                >
                  <option value="">Selecione a marca</option>
                  {brands.map((brand, index) => (
                    <option key={index} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Opção para agrupar modelos */}
            <div className="group-models-option">
              <label className="checkbox-container">
                <input 
                  type="checkbox"
                  checked={groupModels}
                  onChange={handleGroupModelsChange}
                  disabled={generating}
                />
                <span className="checkbox-label">Agrupar modelos com direção D/E</span>
              </label>
              <div className="tooltip-icon">
                ?
                <span className="tooltip-text">
                  Agrupa modelos que diferem apenas por D (direita) ou E (esquerda) e têm o mesmo preço.
                  <br/>Exemplo: 040TRFD e 040TRFE serão mostrados como 040TRF (D/E).
                </span>
              </div>
            </div>
            
            <div className="label-preview-section">
              {selectedProduct && (
                <LabelPreviewComponent product={selectedProduct} />
              )}
            </div>
            
            <div className="action-container">
              <StyledButton 
                type="primary" 
                size="large" 
                disabled={selectedProducts.length === 0 || generating}
                onClick={generatePDF}
              >
                {generating 
                  ? 'Gerando PDF...' 
                  : `Gerar ${selectedProducts.length > 0 ? `${selectedProducts.length} Etiquetas` : 'Etiquetas'}`}
              </StyledButton>
            </div>
            
            {filteredPrices.length > 0 && (
              <div className="products-list-container">
                <div className="products-header">
                  <h3>Produtos Selecionados ({selectedProducts.length}/{filteredPrices.length})</h3>
                  <div className="selection-actions">
                    <button 
                      className="selection-button select-all"
                      onClick={handleSelectAllProducts}
                      disabled={generating || selectedProducts.length === filteredPrices.length}
                    >
                      Selecionar Todos
                    </button>
                    <button 
                      className="selection-button deselect-all"
                      onClick={handleDeselectAllProducts}
                      disabled={generating || selectedProducts.length === 0}
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>
                <div className="products-table-container">
                  <table className="products-table">
                    <thead>
                      <tr className="products-table-header">
                        <th className="align-center">Selecionar</th>
                        <th>Modelo</th>
                        <th className="align-right">Preço à Vista</th>
                        <th className="align-right">Total Parcelado</th>
                        <th className="align-right">Parcela 12x</th>
                        <th className="align-center">Visualizar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrices.map((price) => (
                        <tr 
                          key={price.id} 
                          className={`products-table-row ${selectedProduct && selectedProduct.id === price.id ? 'selected-row' : ''}`}
                        >
                          <td className="products-table-cell align-center">
                            <input 
                              type="checkbox"
                              className="product-checkbox"
                              checked={selectedProducts.includes(price.id)}
                              onChange={() => handleToggleProductSelection(price.id)}
                              disabled={generating}
                            />
                          </td>
                          <td className="products-table-cell">{price.modelo}</td>
                          <td className="products-table-cell align-right">{formatCurrency(price.precoAvista)}</td>
                          <td className="products-table-cell align-right">{formatCurrency(price.parceladoCheio)}</td>
                          <td className="products-table-cell align-right">{formatCurrency(price.parcelado12x)}</td>
                          <td className="products-table-cell align-center">
                            <button 
                              className="preview-button"
                              onClick={() => handleProductSelect(price)}
                              disabled={generating}
                            >
                              👁️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLabelPage;