import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header.jsx';
import './plan.css';


function App({children}) {
  const navigate = useNavigate();
  const gotoDocumenttitle=()=>{
    navigate("/Documenttitle")
  }
  const plans = [
    {
      name: 'Daily',
      description: 'For clients looking for',
      feature: 'basic AI automation',
      price: '3',
      popular: false
    },
    {
      name: 'Weekly',
      description: 'For clients looking for',
      feature: 'advanced AI features',
      price: '18',
      popular: true
    },
    {
      name: 'Monthly',
      description: 'For clients looking for',
      feature: 'complete AI automation',
      price: '73',
      popular: false
    }
  ]

  return (
    
    <div className="pricing-container">
      <Header />
      {plans.map((plan) => (
        <div 
          key={plan.name} 
          className={`pricing-card ${plan.popular ? 'popular' : ''}`}
        >
          <h2 className="plan-name">{plan.name}</h2>
          <div className="plan-description">
            <p>{plan.description}</p>
            <p><strong>{plan.feature}</strong></p>
          </div>
          
          <div className="price">
            <span3 className="currency">$</span3>
            <span3 className="amount">{plan.price}</span3>
            <span3 className="period">/mo</span3>
          </div>
          
          <div className="discount-badge">
            Annual discount applied
          </div>
          
          <button className="trial-button" onClick={gotoDocumenttitle}>
            Start free trial
          </button>
          
          {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
        </div>
      ))}
    </div>
  )
}

export default App
