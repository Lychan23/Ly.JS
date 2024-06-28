// /pages/page.tsx

import { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';

const Page: NextPage = () => {
  return (
    <div>
      <Head>
        <title>My Vercel Page</title>
        <meta name="description" content="A sample page deployed on Vercel" />
      </Head>
      <main>
        <h1>Welcome to My Page</h1>
        <p>This is a sample page deployed on Vercel using Next.js.</p>
      </main>
    </div>
  );
};

export default Page;
