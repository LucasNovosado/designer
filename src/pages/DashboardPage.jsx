// src/pages/DashboardPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import PriceUploadComponent from '../components/PriceUploadComponent';
import priceService from '../services/priceService';
import { formatCurrency } from '../utils/formatPrice'; // Importar a função de formatação
import './DashboardPage.css';
import StyledButton from '../components/StyledButton';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [brandStats, setBrandStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está logado usando authService
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      // Se não estiver logado, redireciona para o login
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    
    // Atualiza o relógio a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Carregar estatísticas de marcas
    const fetchBrandStats = async () => {
      try {
        const stats = await priceService.getPriceStats();
        setBrandStats(stats);
      } catch (error) {
        console.error('Erro ao buscar estatísticas de marcas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrandStats();
    
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleCreateLabels = () => {
    // Redirecionar para a página de criação de etiquetas
    navigate('/create-label');
  };
  
  const handleManageBrands = () => {
    // Redirecionar para a página de gerenciamento de marcas
    navigate('/manage-brands');
  };

  // Formatação da data
  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Formatação da hora
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!user) {
    return <div className="loading">Carregando sistema</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Painel de Controle</h1>
        <StyledButton 
          type="secondary" 
          size="medium" 
          onClick={handleLogout}
        >
          Encerrar Sessão
        </StyledButton>
      </header>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Bem-vindo, {user.get('username')}!</h2>
          <p>Você está logado com sucesso no sistema. <span className="highlight">{formattedDate}</span> | <span className="highlight">{formattedTime}</span></p>
        </div>
        
        <div className="dashboard-section">
          <div className="dashboard-cards">
            {/* Card de informações da conta */}
            
            
            {/* Card para upload de tabela de preços */}
            <div className="dashboard-card price-upload-card">
              <h3>Gerenciamento de Preços</h3>
              <PriceUploadComponent />
            </div>
            
            {/* Card para criar etiquetas */}
            <div className="dashboard-card price-upload-card">
              <h3>Criar Etiquetas de Preço</h3>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center', 
                height: '80%',
                padding: '20px'
              }}>
                <p style={{ marginBottom: '20px', textAlign: 'center' }}>
                  Gere etiquetas de preço para impressão com base nos dados cadastrados.
                </p>
                <StyledButton 
                  type="primary" 
                  size="large" 
                  icon="excel-icon"
                  onClick={handleCreateLabels}
                >
                  Gerar Etiquetas
                </StyledButton>
              </div>
            </div>
            
            {/* Novo Card para gerenciamento de marcas */}
            <div className="dashboard-card price-upload-card">
              <h3>Gerenciamento de Marcas</h3>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center', 
                height: '80%',
                padding: '20px'
              }}>
                <p style={{ marginBottom: '20px', textAlign: 'center' }}>
                  Gerencie as marcas cadastradas por estado e remova registros desnecessários.
                </p>
                {brandStats && (
                  <div style={{ marginBottom: '20px', width: '100%' }}>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-around', 
                      backgroundColor: '#252525', 
                      padding: '10px', 
                      borderRadius: '8px' 
                    }}>
                      <div>
                        <strong>PR:</strong> {brandStats.pricesByState?.PR || 0} produtos
                      </div>
                      <div>
                        <strong>SP:</strong> {brandStats.pricesByState?.SP || 0} produtos
                      </div>
                    </div>
                  </div>
                )}
                <StyledButton 
                  type="primary" 
                  size="large" 
                  onClick={handleManageBrands}
                >
                  Gerenciar Marcas
                </StyledButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;