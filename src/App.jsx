import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');

    // On page load/refresh, always scroll to the top of the home page
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Handle any delayed browser rendering or anchor restoration
    const t1 = setTimeout(() => window.scrollTo(0, 0), 10);
    const t2 = setTimeout(() => window.scrollTo(0, 0), 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
