import React, { useState, useEffect, useMemo } from 'react';

const LoanCalculator = ({ price }) => {
  // Parsing initial du prix transmis en props
  const initialPrice = useMemo(() => {
    const num = Number(price);
    return !isNaN(num) && num > 0 ? num : 1000000;
  }, [price]);

  // États pour les 4 valeurs du simulateur
  const [loanPrice, setLoanPrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(Math.round(initialPrice * 0.1)); // 10% par défaut
  const [interestRate, setInterestRate] = useState(4.5); // 4.5% par défaut
  const [duration, setDuration] = useState(20); // 20 ans par défaut

  // Synchronisation si le prix du bien change (ex: chargement asynchrone des détails)
  useEffect(() => {
    const num = Number(price);
    if (!isNaN(num) && num > 0) {
      setLoanPrice(num);
      setDownPayment(Math.round(num * 0.1));
    }
  }, [price]);

  // Calcul mathématique de la mensualité
  const { principal, monthlyPayment, totalPayment, totalInterest } = useMemo(() => {
    const pPrice = Math.max(0, Number(loanPrice) || 0);
    const pDown = Math.max(0, Number(downPayment) || 0);
    const pPrincipal = Math.max(0, pPrice - pDown);

    const rate = Math.max(0, Number(interestRate) || 0);
    const years = Math.max(1, Number(duration) || 1);
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
  }, [loanPrice, downPayment, interestRate, duration]);

  // Formatage en Dirham Marocain (DH)
  const formatDH = (value) => {
    return Number(value || 0).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Pourcentage d'apport calculé dynamiquement
  const downPaymentPercent = useMemo(() => {
    if (!loanPrice || loanPrice <= 0) return 0;
    return Math.round(((Number(downPayment) || 0) / loanPrice) * 100);
  }, [loanPrice, downPayment]);

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

      {/* Résultat mis en avant : Mensualité (fond gris clair, texte noir) */}
      <div className="loan-result-card">
        <span className="loan-result-label">Mensualité estimée</span>
        <div className="loan-result-amount">
          {formatDH(monthlyPayment)} <span className="loan-result-unit">DH / mois</span>
        </div>
        <div className="loan-result-details">
          <span>Montant emprunté : <strong>{formatDH(principal)} DH</strong></span>
          <span>Durée : <strong>{duration} ans ({duration * 12} mois)</strong></span>
        </div>
      </div>

      {/* Formulaire des 4 champs de saisie */}
      <div className="loan-calculator-inputs">
        {/* 1. Prix du bien */}
        <div className="loan-input-group">
          <div className="loan-label-row">
            <label htmlFor="loan-price">Prix du bien</label>
            <span className="loan-value-hint">{formatDH(loanPrice)} DH</span>
          </div>
          <div className="loan-input-wrapper">
            <input
              id="loan-price"
              type="number"
              min="0"
              step="10000"
              value={loanPrice}
              onChange={(e) => setLoanPrice(Number(e.target.value))}
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
              {downPaymentPercent}% ({formatDH(downPayment)} DH)
            </span>
          </div>
          <div className="loan-input-wrapper">
            <input
              id="loan-down-payment"
              type="number"
              min="0"
              max={loanPrice}
              step="5000"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="loan-input-field"
            />
            <span className="loan-input-suffix">DH</span>
          </div>
        </div>

        {/* 3. Taux d'intérêt annuel */}
        <div className="loan-input-group">
          <div className="loan-label-row">
            <label htmlFor="loan-interest-rate">Taux d'intérêt annuel</label>
            <span className="loan-value-hint">{interestRate}%</span>
          </div>
          <div className="loan-input-wrapper">
            <input
              id="loan-interest-rate"
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="loan-input-field"
            />
            <span className="loan-input-suffix">%</span>
          </div>
        </div>

        {/* 4. Durée du prêt */}
        <div className="loan-input-group">
          <div className="loan-label-row">
            <label htmlFor="loan-duration">Durée du prêt</label>
            <span className="loan-value-hint">{duration} ans</span>
          </div>
          <div className="loan-input-wrapper">
            <input
              id="loan-duration"
              type="number"
              min="1"
              max="35"
              step="1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="loan-input-field"
            />
            <span className="loan-input-suffix">Années</span>
          </div>
        </div>
      </div>

      {/* Raccourcis rapides de durée (15 ans, 20 ans, 25 ans) */}
      <div className="loan-duration-quick-picks">
        {[10, 15, 20, 25].map((years) => (
          <button
            key={years}
            type="button"
            className={`loan-pill-btn ${duration === years ? 'active' : ''}`}
            onClick={() => setDuration(years)}
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

