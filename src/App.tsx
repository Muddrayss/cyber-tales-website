import { Routes, Route } from 'react-router-dom';

import Layout from './screens/layout.screen';
import NotFound from './screens/not-found.screen';
import Home from './screens/home.screen';
import AppScreen from './screens/app.screen';
import ManualScreen from './screens/manual.screen';
import Credits from './screens/credits.screen';
import Music from './screens/music.screen';
import Instagram from './screens/instagram.screen';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='*' element={<NotFound />} />
        <Route index element={<Home />} />
        <Route path='/app' element={<AppScreen />} />
        <Route path='/manual' element={<ManualScreen />} />
        <Route path='/music' element={<Music />} />
        <Route path='/instagram' element={<Instagram />} />
        <Route path='/credits' element={<Credits />} />
      </Route>
    </Routes>
  );
}

export default App;
