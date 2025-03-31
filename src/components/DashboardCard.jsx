// src/components/DashboardCard.jsx

import React from 'react';
import PropTypes from 'prop-types';
import './DashboardCard.css';

const DashboardCard = ({ title, items }) => {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      {items.map((item, index) => (
        <p key={index}>
          <span>{item.label}</span>
          <span className="highlight">{item.value}</span>
        </p>
      ))}
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired
    })
  ).isRequired
};

export default DashboardCard;