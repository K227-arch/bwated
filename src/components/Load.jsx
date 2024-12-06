import React from 'react';
import { useNavigate } from 'react-router-dom';

function Load({ children }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path); // Navigate programmatically to the specified path
  };

  return (
    <div>
      <main>{children}</main>
    </div>
  );
}

export default Load;
