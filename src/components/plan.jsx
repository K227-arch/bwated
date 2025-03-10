import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from '@/lib/supabaseClient';
import "./plan.css";

function BillingPage({ children, hideSideNav, isSideNavVisible }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  // Stripe initialization
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

  // Fetch user and balance on component mount
  useEffect(() => {
    const fetchUserAndBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Fetch user's account balance
        const { data: balanceData, error: balanceError } = await supabase
          .from('user_accounts')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (balanceError) throw balanceError; 
        setBalance(balanceData?.balance || 0);
      } catch (error) {
        console.error('Error fetching user or balance:', error);
        setError('Failed to load user information');
      }
    };

    fetchUserAndBalance();
  }, []);

  // Predefined deposit options
  const depositOptions = [
    {
      id: 'deposit_10',
      name: "Basic Deposit",
      amount: 10,
      credits: 100,
      bonus: 0,
      popular: false,
    },
    {
      id: 'deposit_50',
      name: "Standard Deposit",
      amount: 50,
      credits: 600,
      bonus: 50, // 10% bonus
      popular: true,
    },
    {
      id: 'deposit_100',
      name: "Premium Deposit",
      amount: 100,
      credits: 1300,
      bonus: 150, // 15% bonus
      popular: false,
    },
  ];

  const makeDeposit = async (deposit) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create Checkout Session for deposit
      const response = await fetch("https://bwat.netlify.app/.netlify/functions/api/create-checkout-session", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ 
          amount: deposit.amount,
          userId: user.id,
          email: user.email,
          credits: deposit.credits,
          bonus: deposit.bonus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment processing failed');
      }

      const session = await response.json();

      // Validate session
      if (!session.id) {
        throw new Error('Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({ 
        sessionId: session.id 
      });

      // Handle any errors from Stripe
      if (result.error) {
        throw result.error;
      }

    } catch (error) {
      console.error('Deposit Error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom deposit
  const handleCustomDeposit = async () => {
    const amount = parseFloat(customAmount);
    
    // Validate custom amount
    if (isNaN(amount) || amount < 5) {
      setError('Minimum deposit is $5');
      return;
    }

    // Calculate credits (1 credit per $0.10)
    const credits = Math.floor(amount * 10);
    const bonus = Math.floor(credits * 0.05); // 5% bonus for custom deposits

    await makeDeposit({
      id: 'custom_deposit',
      name: "Custom Deposit",
      amount: amount,
      credits: credits,
      bonus: bonus,
      popular: false
    });
  };

  // Transaction history
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (transactionError) throw transactionError;
        setTransactions(transactionData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [user]);

  return (
    <div className="pricing-container">
      <Header />
      <Sidebar isVisible={isSideNavVisible} willHideSideNav={hideSideNav} />

      <div className="plan-words">
        <h1>Billing & Credits</h1>
        <p>
          Add credits to your account to access advanced AI features and 
          continue using our services seamlessly.
        </p>
      </div>

      <div className="account-summary">
        <div className="balance-card">
          <h2>Current Balance</h2>
          <div className="balance">
            <span className="amount">${balance.toFixed(2)}</span>
            <span className="credits">Credits: {Math.floor(balance * 10)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="pricing-cards-container">
        {depositOptions.map((deposit) => (
          <div
            key={deposit.id}
            className={`pricing-card ${deposit.popular ? "popular" : ""}`}
          >
            <h2 className="plan-name">{deposit.name}</h2>
            <div className="plan-description">
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{deposit.amount}</span>
              </div>
              <div className="credits-info">
                <p>{deposit.credits} Credits</p>
                {deposit.bonus > 0 && (
                  <div className="bonus-badge">
                    +{deposit.bonus} Bonus Credits
                  </div>
                )}
              </div>
            </div>

            <button 
              className="trial-button" 
              onClick={() => makeDeposit(deposit)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Add Credits'}
            </button>

            {deposit.popular && <div className="popular-badge">BEST VALUE</div>}
          </div>
        ))}

        {/* Custom Deposit Option */}
        <div className="pricing-card custom-deposit">
          <h2 className="plan-name">Custom Deposit</h2>
          <div className="custom-deposit-input">
            <div className="input-group">
              <span className="currency-symbol">$</span>
              <input 
                type="number" 
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount (min $5)"
                min="5"
                step="1"
              />
            </div>
            <div className="custom-deposit-info">
              <p>
                Credits: {isNaN(parseFloat(customAmount)) 
                  ? 0 
                  : Math.floor(parseFloat(customAmount) * 10)}
              </p>
              <p>
                Bonus: {isNaN(parseFloat(customAmount)) 
                  ? 0 
                  : Math.floor(Math.floor(parseFloat(customAmount) * 10) * 0.05)}
              </p>
            </div>
          </div>

          <button 
            className="trial-button" 
            onClick={handleCustomDeposit}
            disabled={loading || !customAmount || parseFloat(customAmount) < 5}
          >
            {loading ? 'Processing...' : 'Add Custom Credits'}
          </button>
        </div>
      </div>

      <div className="transaction-history">
        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Credits</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                <td>{transaction.type}</td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>{transaction.credits}</td>
                <td>{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BillingPage;
