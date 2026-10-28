import React from 'react';

const statsData = [
  {
    id: 1,
    value: '8 500+',
    label: 'Annonces en ligne',
  },
  {
    id: 2,
    value: '5 200+',
    label: 'Clients accompagnés',
  },
  {
    id: 3,
    value: '120+',
    label: 'Agences partenaires',
  },
  {
    id: 4,
    value: '95 %',
    label: 'Satisfaction',
  },
];

const StatsBanner = () => {
  return (
    <section className="urbanet-stats-banner">
      <div className="urbanet-stats-pattern"></div>
      <div className="urbanet-container">
        <div className="urbanet-stats-grid">
          {statsData.map((stat) => (
            <div key={stat.id} className="urbanet-stat-item">
              <div className="stat-number">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
