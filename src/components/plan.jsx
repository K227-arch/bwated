import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { supabase } from '@/lib/supabaseClient';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import "./plan.css";

function BillingPage({ children, hideSideNav, isSideNavVisible }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  // Fetch user and balance on component mount
  useEffect(() => {
    const fetchUserAndBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Fetch user's account balance
        const { data: balanceData, error: balanceError } = await supabase
          .from('users')
          .select('credit')
          .eq('auth_id', user.id)
          .single();

        if (balanceError) throw balanceError; 
        setBalance(balanceData?.credit || 0);
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
      amount: 5000, // 10 credits
      credits: 10,
      bonus: 0,
      popular: false,
    },
    {
      id: 'deposit_50',
      name: "Standard Deposit",
      amount: 25000, // 50 credits
      credits: 50,
      bonus: 5, // 10% bonus
      popular: true,
    },
    {
      id: 'deposit_100',
      name: "Premium Deposit",
      amount: 50000, // 100 credits
      credits: 100,
      bonus: 15, // 15% bonus
      popular: false,
    },
  ];

  const handleFlutterPayment = useFlutterwave({
    public_key: 'FLWPUBK_TEST-eca88e15b79755134826c5f44dc6126f-X',
    tx_ref: Date.now(),
    amount: 10000, // This will be set dynamically
    currency: 'UGX',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || 'user@gmail.com',
      phone_number: user?.phone_number || '070********',
      name: user?.full_name || 'john doe',
    },
    customizations: {
      title: 'Bwated Credit',
      description: 'Payment for credit',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  });

  const makeDeposit = async (deposit) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await handleFlutterPayment({
        callback: (response) => {
          console.log(response);
          closePaymentModal();
        },
        onClose: () => {},
        amount: deposit.amount, // Set the amount dynamically from the deposit object
      });

      if (!response) {
        throw new Error('Payment processing failed');
      }

      // Handle successful payment response here
      // You can update the user's balance in your database

    } catch (error) {
      console.error('Deposit Error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom deposit
  const handleCustomDeposit = async () => {
    const amount = parseFloat(customAmount) * 500; // Convert UGX to credits
    
    // Validate custom amount
    if (isNaN(amount) || amount < 2500) { // Minimum deposit is 5000 UGX
      setError('Minimum deposit is 5000 UGX');
      return;
    }

    // Calculate credits (1 credit per 500 UGX)
    const credits = Math.floor(amount / 500);
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
        <h1>PRICING</h1>
        <p>
          Add credits to your account to access advanced AI features and 
          continue using our services seamlessly.
        </p>
      </div>

      <div className="account-summary">
        <div className="balance-card">
          <h2>Current Balance</h2>
          <div className="balance">
            <span className="amount">{balance.toFixed(2)} UGX</span>
            <span className="credits">Credits: {Math.floor(balance / 500)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="pricing-card-wrapper">
        <div className="pricing-cards-container">
          {depositOptions.map((deposit) => (
            <div
              key={deposit.id}
              className={`pricing-card ${deposit.popular ? "popular" : ""}`}
            >
              <h2 className="plan-name">{deposit.name}</h2>
              <div className="plan-description">
                <div className="price">
                  <span className="currency">UGX</span>
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
                <span className="currency-symbol">UGX</span>
                <input 
                  type="number" 
                  className='pricing'
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount (min 5000 UGX)"
                  min="5000"
                  step="1"
                />
              </div>
              <div className="custom-deposit-info">
                <p>
                  Credits: {isNaN(parseFloat(customAmount)) 
                    ? 0 
                    : Math.floor(parseFloat(customAmount) / 500)}
                </p>
                <p>
                  Bonus: {isNaN(parseFloat(customAmount)) 
                    ? 0 
                    : Math.floor(Math.floor(parseFloat(customAmount) / 500) * 0.05)}
                </p>
              </div>
            </div>

            <button 
              className="trial-button" 
              onClick={handleCustomDeposit}
              disabled={loading || !customAmount || parseFloat(customAmount) < 5000}
            >
              {loading ? 'Processing...' : 'Add Custom Credits'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingPage;
