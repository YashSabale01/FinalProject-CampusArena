import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bg-primary', '#111827');
      root.style.setProperty('--bg-secondary', '#1f2937');
      root.style.setProperty('--text-primary', '#f9fafb');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--card-bg', '#374151');
      document.body.className = 'dark-theme';
    } else {
      root.style.setProperty('--bg-primary', '#f9fafb');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6b7280');
      root.style.setProperty('--card-bg', '#ffffff');
      document.body.className = 'light-theme';
    }
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Force re-render by updating a data attribute
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
    >
      <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
};

export default ThemeToggle;