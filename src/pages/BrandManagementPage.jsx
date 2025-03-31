// src/pages/BrandManagementPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import parseService from '../services/parseService';
import priceService from '../services/priceService';
import StyledButton from '../components/StyledButton';
import './BrandManagementPage.css';

const BrandManagementPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [brands, setBrands] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [editingBrand, setEditingBrand] = useState(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const editInputRef = useRef(null);
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

  // Buscar estatísticas ao carregar a página
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await priceService.getPriceStats();
        setStatistics(stats);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);

  // Carregar marcas quando o estado é selecionado
  useEffect(() => {
    if (selectedState) {
      loadBrandsByState(selectedState);
    } else {
      setBrands([]);
      setSelectedBrands([]);
    }
  }, [selectedState]);

  // Função para carregar marcas por estado
  const loadBrandsByState = async (state) => {
    try {
      setLoading(true);
      
      // Busca os preços do estado selecionado
      const query = parseService.createQuery('Prices');
      query.equalTo('estado', state);
      query.limit(1000);
      const results = await query.find();
      
      // Extrai as marcas únicas e conta produtos por marca
      const brandsMap = {};
      
      results.forEach(price => {
        const marca = price.get('marca');
        if (!brandsMap[marca]) {
          brandsMap[marca] = {
            nome: marca,
            produtos: 0
          };
        }
        brandsMap[marca].produtos += 1;
      });
      
      // Converte o mapa em array e ordena por nome
      const brandsArray = Object.values(brandsMap).sort((a, b) => 
        a.nome.localeCompare(b.nome)
      );
      
      setBrands(brandsArray);
      setSelectedBrands([]);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
      setLoading(false);
    }
  };

  // Função para deletar marcas selecionadas
  const handleDeleteSelectedBrands = async () => {
    if (selectedBrands.length === 0) {
      alert('Selecione pelo menos uma marca para excluir.');
      return;
    }
    
    if (!window.confirm(`Tem certeza que deseja excluir ${selectedBrands.length} marcas selecionadas e todos os seus produtos?`)) {
      return;
    }
    
    try {
      setDeleting(true);
      
      let totalDeleted = 0;
      let deletedBrands = 0;
      
      // Para cada marca selecionada
      for (const brandName of selectedBrands) {
        // Busca todos os produtos da marca no estado selecionado
        const query = parseService.createQuery('Prices');
        query.equalTo('estado', selectedState);
        query.equalTo('marca', brandName);
        const productsToDelete = await query.find();
        
        // Deleta todos os produtos encontrados
        if (productsToDelete.length > 0) {
          await parseService.deleteObjects(productsToDelete);
          totalDeleted += productsToDelete.length;
          deletedBrands++;
        }
      }
      
      // Atualiza a lista de marcas
      await loadBrandsByState(selectedState);
      
      alert(`Exclusão concluída: ${deletedBrands} marcas e ${totalDeleted} produtos foram excluídos com sucesso.`);
      
      // Atualiza as estatísticas
      const stats = await priceService.getPriceStats();
      setStatistics(stats);
      
      setDeleting(false);
    } catch (error) {
      console.error('Erro ao deletar marcas selecionadas:', error);
      alert('Erro ao deletar marcas. Por favor, tente novamente.');
      setDeleting(false);
    }
  };
  
  // Função para verificar se uma marca está selecionada
  const isBrandSelected = (brandName) => {
    return selectedBrands.includes(brandName);
  };
  
  // Função para alternar a seleção de uma marca
  const toggleBrandSelection = (brandName) => {
    if (isEditing) return; // Não permitir seleção durante edição
    
    setSelectedBrands(prevSelected => {
      if (prevSelected.includes(brandName)) {
        // Se já está selecionada, remove da seleção
        return prevSelected.filter(name => name !== brandName);
      } else {
        // Se não está selecionada, adiciona à seleção
        return [...prevSelected, brandName];
      }
    });
  };
  
  // Selecionar todas as marcas
  const selectAllBrands = () => {
    if (isEditing) return; // Não permitir seleção durante edição
    setSelectedBrands(brands.map(brand => brand.nome));
  };
  
  // Desmarcar todas as marcas
  const deselectAllBrands = () => {
    if (isEditing) return; // Não permitir seleção durante edição
    setSelectedBrands([]);
  };
  
  // Iniciar edição de marca
  const handleStartEdit = (brand) => {
    setEditingBrand(brand.nome);
    setNewBrandName(brand.nome);
    setIsEditing(true);
    
    // Focar no input depois que o componente for renderizado
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 0);
  };
  
  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingBrand(null);
    setNewBrandName('');
    setIsEditing(false);
  };
  
  // Salvar edição de marca
  const handleSaveEdit = async () => {
    if (newBrandName.trim() === '') {
      alert('O nome da marca não pode estar vazio.');
      return;
    }
    
    if (newBrandName === editingBrand) {
      // Nome não mudou, só cancelar a edição
      handleCancelEdit();
      return;
    }
    
    // Verificar se já existe uma marca com esse nome
    const existingBrand = brands.find(
      brand => brand.nome.toLowerCase() === newBrandName.toLowerCase() && brand.nome !== editingBrand
    );
    
    if (existingBrand) {
      alert(`Já existe uma marca com o nome "${newBrandName}" cadastrada.`);
      return;
    }
    
    try {
      setDeleting(true); // Reutilizando o estado para bloquear interações
      
      // Busca todos os produtos da marca atual no estado selecionado
      const query = parseService.createQuery('Prices');
      query.equalTo('estado', selectedState);
      query.equalTo('marca', editingBrand);
      const productsToUpdate = await query.find();
      
      if (productsToUpdate.length === 0) {
        alert('Nenhum produto encontrado para esta marca.');
        setDeleting(false);
        handleCancelEdit();
        return;
      }
      
      // Confirmação do usuário
      if (!window.confirm(`Tem certeza que deseja renomear a marca "${editingBrand}" para "${newBrandName}"? Esta ação atualizará ${productsToUpdate.length} produtos.`)) {
        setDeleting(false);
        return;
      }
      
      // Atualiza todos os produtos encontrados com o novo nome da marca
      let updatedCount = 0;
      for (const product of productsToUpdate) {
        product.set('marca', newBrandName);
        await product.save();
        updatedCount++;
      }
      
      // Atualiza a lista de marcas
      await loadBrandsByState(selectedState);
      
      alert(`Marca renomeada com sucesso. ${updatedCount} produtos foram atualizados.`);
      
      // Atualiza as estatísticas
      const stats = await priceService.getPriceStats();
      setStatistics(stats);
      
      setDeleting(false);
      handleCancelEdit();
      
    } catch (error) {
      console.error('Erro ao editar marca:', error);
      alert('Erro ao editar marca. Por favor, tente novamente.');
      setDeleting(false);
    }
  };

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading && !brands.length) {
    return <div className="loading">Carregando dados...</div>;
  }

  return (
    <div className="brand-management-container">
      <header className="brand-management-header">
        <h1>Gerenciamento de Marcas</h1>
        <StyledButton 
          type="secondary" 
          size="medium" 
          onClick={handleBack}
        >
          Voltar ao Dashboard
        </StyledButton>
      </header>
      
      <div className="brand-management-content">
        <div className="welcome-card">
          <h2>Gerenciar Marcas Registradas</h2>
          <p>Selecione um estado para visualizar e gerenciar as marcas cadastradas.</p>
        </div>
        
        <div className="dashboard-section">
          <div className="dashboard-card filter-card">
            <h3>Filtrar por Estado</h3>
            
            <div className="filter-container">
              <div className="filter-group">
                <label className="filter-label">Estado:</label>
                <select 
                  className="filter-select"
                  value={selectedState}
                  onChange={handleStateChange}
                  disabled={deleting}
                >
                  <option value="">Selecione o estado</option>
                  <option value="PR">Paraná</option>
                  <option value="SP">São Paulo</option>
                </select>
              </div>
            </div>

            {selectedState && (
              <div className="state-summary">
                <p>Total de marcas no estado: <strong>{brands.length}</strong></p>
                <p>Total de produtos no estado: <strong>
                  {statistics.pricesByState && statistics.pricesByState[selectedState] 
                    ? statistics.pricesByState[selectedState] 
                    : '...'}
                </strong></p>
              </div>
            )}
            
            {brands.length > 0 && (
              <div className="brands-list-container">
                <div className="brands-header">
                  <h3>Marcas no Estado {selectedState} ({brands.length})</h3>
                  <div className="selection-actions">
                    <StyledButton 
                      type="secondary" 
                      size="small" 
                      onClick={selectAllBrands}
                      disabled={deleting || isEditing || brands.length === selectedBrands.length}
                    >
                      Selecionar Todas
                    </StyledButton>
                    <StyledButton 
                      type="secondary" 
                      size="small" 
                      onClick={deselectAllBrands}
                      disabled={deleting || isEditing || selectedBrands.length === 0}
                    >
                      Desmarcar Todas
                    </StyledButton>
                    <StyledButton 
                      type="danger" 
                      size="small" 
                      onClick={handleDeleteSelectedBrands}
                      disabled={deleting || isEditing || selectedBrands.length === 0}
                    >
                      Excluir Selecionadas ({selectedBrands.length})
                    </StyledButton>
                  </div>
                </div>
                <div className="brands-table-container">
                  <table className="brands-table">
                    <thead>
                      <tr className="brands-table-header">
                        <th className="align-center" style={{ width: '50px' }}>Sel</th>
                        <th>Nome da Marca</th>
                        <th className="align-right">Produtos</th>
                        <th className="align-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map((brand) => (
                        <tr 
                          key={brand.nome} 
                          className={`brands-table-row ${isBrandSelected(brand.nome) ? 'selected-row' : ''}`}
                          onClick={() => editingBrand !== brand.nome && toggleBrandSelection(brand.nome)}
                        >
                          <td className="brands-table-cell align-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox"
                              className="brand-checkbox"
                              checked={isBrandSelected(brand.nome)}
                              onChange={() => toggleBrandSelection(brand.nome)}
                              disabled={deleting || isEditing}
                            />
                          </td>
                          <td className="brands-table-cell">
                            {editingBrand === brand.nome ? (
                              <input 
                                type="text"
                                className="brand-edit-input"
                                value={newBrandName}
                                onChange={(e) => setNewBrandName(e.target.value)}
                                ref={editInputRef}
                                disabled={deleting}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              brand.nome
                            )}
                          </td>
                          <td className="brands-table-cell align-right">{brand.produtos}</td>
                          <td className="brands-table-cell align-center" onClick={(e) => e.stopPropagation()}>
                            {editingBrand === brand.nome ? (
                              <div className="edit-actions">
                                <StyledButton 
                                  type="primary" 
                                  size="small" 
                                  onClick={handleSaveEdit}
                                  disabled={deleting}
                                >
                                  Salvar
                                </StyledButton>
                                <StyledButton 
                                  type="secondary" 
                                  size="small" 
                                  onClick={handleCancelEdit}
                                  disabled={deleting}
                                >
                                  Cancelar
                                </StyledButton>
                              </div>
                            ) : (
                              <div className="brand-actions">
                                <StyledButton 
                                  type="secondary" 
                                  size="small" 
                                  onClick={() => handleStartEdit(brand)}
                                  disabled={deleting || isEditing}
                                >
                                  Editar
                                </StyledButton>
                                <StyledButton 
                                  type="danger" 
                                  size="small" 
                                  onClick={() => toggleBrandSelection(brand.nome)}
                                  disabled={deleting || isEditing}
                                >
                                  {isBrandSelected(brand.nome) ? 'Desmarcar' : 'Selecionar'}
                                </StyledButton>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {selectedState && brands.length === 0 && !loading && (
              <div className="no-brands-message">
                <p>Nenhuma marca encontrada para o estado selecionado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandManagementPage;