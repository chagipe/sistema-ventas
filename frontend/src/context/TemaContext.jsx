import { createContext, useContext, useEffect, useState } from 'react';

const TemaContext = createContext();

export function TemaProvider({ children }) {
  const [oscuro, setOscuro] = useState(() => {
    return localStorage.getItem('tema') === 'oscuro';
  });

  useEffect(() => {
    if (oscuro) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tema', 'oscuro');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tema', 'claro');
    }
  }, [oscuro]);

  const toggleTema = () => setOscuro(!oscuro);

  return (
    <TemaContext.Provider value={{ oscuro, toggleTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export const useTema = () => useContext(TemaContext);