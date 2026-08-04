import { Switch, Route } from 'wouter';
import Home from '@/pages/Home';
import Payment from '@/pages/Payment';
import AdminPanel from '@/pages/AdminPanel';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <Switch>
        <Route path='/' component={Home} />
        <Route path='/payment' component={Payment} />
        <Route path='/admin' component={AdminPanel} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
