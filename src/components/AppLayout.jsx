import React from 'react';
import { Outlet } from 'react-router-dom';
import FlareaAnalyticsConsent from '@/components/FlareaAnalyticsConsent';
import Navbar from '@/components/landing/Navbar';

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <FlareaAnalyticsConsent />
    </>
  );
}
