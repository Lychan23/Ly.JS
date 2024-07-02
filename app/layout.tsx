// app/layout.tsx
import React, { ReactNode } from 'react';
import Head from 'next/head';
import '../ui/global.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Head>
        <title>Ly.JS Project</title>
        <meta name="description" content="A project for displaying information useful for a discord.js project." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>© 2024 Ly.JS Project</p>
      </footer>
    </div>
  );
};

export default Layout;
