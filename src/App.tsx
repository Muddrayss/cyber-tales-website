import { Routes, Route } from 'react-router-dom';

import Layout from './screens/layout.screen';
import NotFound from './screens/not-found.screen';
import Home from './screens/home.screen';
import AppScreen from './screens/app.screen';
import Credits from './screens/credits.screen';
import Music from './screens/music.screen';
import TikTok from './screens/tiktok.screen';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='*' element={<NotFound />} />
        <Route index element={<Home />} />
        <Route path='/app' element={<AppScreen />} />
        <Route path='/music' element={<Music />} />
        <Route path='/tiktok' element={<TikTok />} />
        <Route path='/credits' element={<Credits />} />
      </Route>
    </Routes>
  );
}

export default App;
