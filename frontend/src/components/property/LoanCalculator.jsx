import React, { useState, useEffect, useMemo } from 'react';

const LoanCalculator = ({ price: propPrice }) => {
  // États de type String pour permettre la saisie fluide sans remise à 0 intempestive
  const [price, setPrice] = useState(
    propPrice !== undefined && propPrice !== null && propPrice !== ''
      ? String(propPrice)
      : ''
  );
  const [downPayment, setDownPayment] = useState(
    propPrice && parseFloat(propPrice) > 0
      ? String(Math.round(parseFloat(propPrice) * 0.1))
      : ''
  );
  const [interestRate, setInterestRate] = useState('4.5'); // 4.5% par défaut
  const [duration, setDuration] = useState('20'); // 20 ans par défaut

  // Synchronisation si le prix du bien change (ex: chargement asynchrone des détails)
  useEffect(() => {
    if (propPrice !== undefined && propPrice !== null && propPrice !== '') {
      const num = parseFloat(propPrice);
      if (!isNaN(num) && num > 0) {
        setPrice(String(propPrice));
        setDownPayment(String(Math.round(num * 0.1)));
      }
    }
  }, [propPrice]);

  // Calcul mathématique de la mensualité avec parseFloat(...) || 0
  const { principal, monthlyPayment, totalPayment, totalInterest } = useMemo(() => {
    const pPrice = parseFloat(price) || 0;
    const pDown = parseFloat(downPayment) || 0;
    const pPrincipal = Math.max(0, pPrice - pDown);

    const rate = parseFloat(interestRate) || 0;
    const years = parseFloat(duration) || 0;
    const numberOfPayments = years * 12;

    let monthly = 0;

    if (pPrincipal > 0 && numberOfPayments > 0) {
      if (rate === 0) {
        // Cas particulier : taux d'intérêt à 0%
        monthly = pPrincipal / numberOfPayments;
      } else {
        const monthlyRate = rate / 100 / 12;
        const rateFactor = Math.pow(1 + monthlyRate, numberOfPayments);
        monthly = (pPrincipal * (monthlyRate * rateFactor)) / (rateFactor - 1);
      }
    }

    const total = monthly * numberOfPayments;
    const interest = Math.max(0, total - pPrincipal);

    return {
      principal: pPrincipal,
      monthlyPayment: monthly,
      totalPayment: total,
      totalInterest: interest,
    };
  }, [price, downPayment, interestRate, duration]);

  // Formatage en Dirham Marocain (DH)
  const formatDH = (value) => {
    return Number(value || 0).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Pourcentage d'apport calculé dynamiquement
  const downPaymentPercent = useMemo(() => {
    const pPrice = parseFloat(price) || 0;
    const pDown = parseFloat(downPayment) || 0;
    if (pPrice <= 0) return 0;
    return Math.round((pDown / pPrice) * 100);
  }, [price, downPayment]);

  return (
    <div className="loan-calculator-widget">
      {/* En-tête du calculateur */}
      <div className="loan-calculator-header">
        <div className="loan-badge">
          <span>💳 Simulation financière</span>
        </div>
        <h3 className="loan-calculator-title">Calculateur de prêt</h3>
        <p className="loan-calculator-subtitle">
          Estimez vos mensualités de crédit immobilier pour ce bien.
        </p>
      </div>

      {/* Résultat mis en avant : Mensualité */}
      <div className="loan-result-card">
        <span className="loan-result-label">Mensualité estimée</span>
        <div className="loan-result-amount">
          {formatDH(monthlyPayment)} <span className="loan-result-unit">DH / mois</span>
        </div>
        <div className="loan-result-details">
          <span>Montant emprunté : <strong>{formatDH(principal)} DH</strong></span>
          <span>Durée : <strong>{duration || '0'} ans ({(parseFloat(duration) || 0) * 12} mois)</strong></span>
        </div>
      </div>

      {/* Formulaire des 4 champs de saisie (String states) */}
      <div className="loan-calculator-inputs">
        {/* 1. Prix du bien */}
        <div className="loan-input-group">
          <div className="loan-label-row">
            <label htmlFor="loan-price">Prix du bien</label>
            <span className="loan-value-hint">{formatDH(parseFloat(price) || 0)} DH</span>
          </div>
          <div className="loan-input-wrapper">
            <input
              id="loan-price"
              type="number"
              min="0"
              step="10000"
              placeholder=""
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="loan-input-field"
            />
            <span className="loan-input-suffix">DH</span>
          </div>
        </div>

        {/* 2. Apport initial */}
        <div className="loan-input-group">
          <div className="loan-label-row">
            <label htmlFor="loan-down-payment">Apport initial</label>
            <span className="loan-value-hint">
              {downPaymentPercent}% ({formatDH(parseFloat(downPayment) || 0)} DH)
            </span>
          </div>
          <div className="loan-input-wrapper">
            <input
              id="loan-down-payment"
              type="number"
              min="0"
              step="5000"
              placeholder=""
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              className="loan-input-field"
            />
            <span className="loan-input-suffix">DH</span>
          </div>
        </div>

        {/* 3. Taux d'intérêt annuel */}
        <div className="loan-input-group">
          <div className="loan-label-row">
            <label htmlFor="loan-interest-rate">Taux d'intérêt annuel</label>
            <span className="loan-value-hint">{interestRate || '0'}%</span>
          </div>
          <div className="loan-input-wrapper">
            <input
              id="loan-interest-rate"
              type="number"
              min="0"
              max="20"
              step="0.1"
              placeholder=""
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="loan-input-field"
            />
            <span className="loan-input-suffix">%</span>
          </div>
        </div>

        {/* 4. Durée du prêt */}
        <div className="loan-input-group">
          <div className="loan-label-row">
            <label htmlFor="loan-duration">Durée du prêt</label>
            <span className="loan-value-hint">{duration || '0'} ans</span>
          </div>
          <div className="loan-input-wrapper">
            <input
              id="loan-duration"
              type="number"
              min="1"
              max="35"
              step="1"
              placeholder=""
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="loan-input-field"
            />
            <span className="loan-input-suffix">Années</span>
          </div>
        </div>
      </div>

      {/* Raccourcis rapides de durée (10 ans, 15 ans, 20 ans, 25 ans) */}
      <div className="loan-duration-quick-picks">
        {[10, 15, 20, 25].map((years) => (
          <button
            key={years}
            type="button"
            className={`loan-pill-btn ${duration === String(years) ? 'active' : ''}`}
            onClick={() => setDuration(String(years))}
          >
            {years} ans
          </button>
        ))}
      </div>

      <p className="loan-calculator-disclaimer">
        ℹ️ Simulation indicative non contractuelle à titre purement informatif.
      </p>
    </div>
  );
};

export default LoanCalculator;
