import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Businesses } from '../pages/businesses';
import { Clients } from '../pages/clients';
import { Invoices } from '../pages/invoices';
import { Items } from '../pages/items';
import { Quotes } from '../pages/quotes';
import { Reports } from '../pages/reports';
import { SettingsPage } from '../pages/settings';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/invoices" replace />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="items" element={<Items />} />
      <Route path="clients" element={<Clients />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="reports" element={<Reports />} />
      <Route path="quotes" element={<Quotes />} />
      <Route path="businesses" element={<Businesses />} />
      <Route path="*" element={<Navigate to="/invoices" replace />} />
    </Routes>
  );
};
