import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
