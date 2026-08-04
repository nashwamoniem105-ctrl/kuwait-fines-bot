import { Switch, Route } from 'wouter';
import Home from '@/pages/Home';
import HomeEn from '@/pages/HomeEn';
import Payment from '@/pages/Payment';
import PaymentAr from '@/pages/PaymentAr';
import PaymentEn from '@/pages/PaymentEn';
import AdminPanel from '@/pages/AdminPanel';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <Switch>
        <Route path='/' component={Home} />
        <Route path='/ar' component={Home} />
        <Route path='/en' component={HomeEn} />
        <Route path='/payment' component={Payment} />
        <Route path='/payment/ar' component={PaymentAr} />
        <Route path='/payment/en' component={PaymentEn} />
        <Route path='/admin' component={AdminPanel} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
