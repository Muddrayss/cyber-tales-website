import { Routes, Route } from 'react-router-dom';

import Layout from './screens/layout.screen';
import NotFound from './screens/not-found.screen';
import Home from './screens/home.screen';
import AboutScreen from '@screens/about.screen';
import AppScreen from './screens/app.screen';
import MinigamesScreen from './screens/minigames/index.screen';
import MinigamesDifficultySelection from './screens/minigames/difficulty-selection.screen';
import MinigamesGame from './screens/minigames/game.screen';
// import StaffScanner from './screens/staff-scanner.screen';
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
        <Route path='/about' element={<AboutScreen />} />
        <Route path='/minigames'>
          <Route index element={<MinigamesScreen />} />
          <Route path=':game' element={<MinigamesDifficultySelection />} />
          <Route path=':game/:difficulty' element={<MinigamesGame />} />
        </Route>
        <Route path='/manual' element={<ManualScreen />} />
        <Route path='/music' element={<Music />} />
        {/* DEPRECTATED: <Route path='/instagram' element={<Instagram />} /> */}
        {/* <Route path='/staff-scanner' element={<StaffScanner />} /> */}
        <Route path='/credits' element={<Credits />} />
      </Route>
    </Routes>
  );
}

export default App;
