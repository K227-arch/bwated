import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import {loadStripe} from "@stripe/stripe-js";
import "./plan.css";

function App({ children, hideSideNav, isSideNavVisible }) {
  const navigate = useNavigate();
  const gotoDocumenttitle = () => {
    navigate("/Documenttitle");
  };
  const plans = [
    {
      name: "Daily",
      description: "For clients looking for",
      feature: "basic AI automation",
      price: "2",
      popular: false,
    },
    {
      name: "Weekly",
      description: "For clients looking for",
      feature: "advanced AI features",
      price: "10",
      popular: true,
    },
    {
      name: "Monthly",
      description: "For clients looking for",
      feature: "complete AI automation",
      price: "40",
      popular: false,
    },
  ];
  const makePayment = async (price) => {
    const stripe = await loadStripe("pk_test_51QtYspRlnSkWgwS20mWflqa7FhSu15bjffVzSJrqXPbYZp9SN206UAsOCb9F50jjMUGW6EhwSBUlCE4cd4M56UpU00oI6FikGt");
    
    if (!stripe) return;

    const response = await fetch("https://localhost:5000/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });

    const session = await response.json();
    if (session.id) {
      stripe.redirectToCheckout({ sessionId: session.id });
    }
  };

  return (
    <div className="pricing-container">
      <Header />
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />

      <div className="plan-words">
        <h1>Pricing</h1>
        <p>
          Start with a free demo to speed up your workflow on public projects or
          boost your entire team with instantly-opening production environments.
        </p>
      </div>
      <div className="pricing-cards-container">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`pricing-card ${plan.popular ? "popular" : ""}`}
          >
            <h2 className="plan-name">{plan.name}</h2>
            <div className="plan-description">
              <p>{plan.description}</p>
              <p>
                <strong>{plan.feature}</strong>
              </p>
            </div>

            <div className="price">
              <span3 className="currency">$</span3>
              <span3 className="amount">{plan.price}</span3>
              <span3 className="period">/mo</span3>
            </div>

            <div className="discount-badge">Annual discount applied</div>

            <button className="trial-button" onClick={() => makePayment(plan.price)}>
              Start free trial
            </button>

            {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
