import { Switch, Route } from 'wouter';
import Home from '@/pages/Home';
import Payment from '@/pages/Payment';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Switch>
        <Route path='/' component={Home} />
        <Route path='/payment' component={Payment} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
