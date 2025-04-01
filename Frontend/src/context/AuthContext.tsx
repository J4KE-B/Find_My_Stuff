// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a token and role in localStorage
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');

    if (storedToken) {
      setToken(storedToken);
      setUserRole(storedRole);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
