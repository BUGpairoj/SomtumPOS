import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { POS } from '@/pages/POS';
import { Kitchen } from '@/pages/Kitchen';
import { Orders } from '@/pages/Orders';
import { MenuManagement } from '@/pages/MenuManagement';
import { Dashboard } from '@/pages/Dashboard';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="pos" element={<POS />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
