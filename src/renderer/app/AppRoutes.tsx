import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BusinessesPage } from '../pages/businesses';
import { Categories } from '../pages/categories';
import { ClientsPage } from '../pages/clients';
import { CurrenciesPage } from '../pages/currencies';
import { Invoices } from '../pages/invoices';
import { Items } from '../pages/items';
import { Quotes } from '../pages/quotes';
import { Reports } from '../pages/reports';
import { SettingsPage } from '../pages/settings';
import { UnitsPage } from '../pages/units';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/invoices" replace />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="businesses" element={<BusinessesPage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="currencies" element={<CurrenciesPage />} />
      <Route path="units" element={<UnitsPage />} />

      <Route path="items" element={<Items />} />
      <Route path="categories" element={<Categories />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="reports" element={<Reports />} />
      <Route path="quotes" element={<Quotes />} />
      <Route path="*" element={<Navigate to="/invoices" replace />} />
    </Routes>
  );
};
