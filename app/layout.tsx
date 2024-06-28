// app/layout.tsx

import React, { ReactNode } from 'react';
import './globals.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <header>
        <h1>Site Header</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>Site Footer</p>
      </footer>
    </div>
  );
};

export default Layout;
