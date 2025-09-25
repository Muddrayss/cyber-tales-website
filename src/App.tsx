import { Routes, Route } from 'react-router-dom';

import Layout from './screens/layout.screen';
import NotFound from './screens/not-found.screen';
import Home from './screens/home.screen';
import AboutScreen from '@screens/about.screen';
import MinigamesScreen from './screens/minigames/index.screen';
import MinigamesDifficultySelection from './screens/minigames/difficulty-selection.screen';
import MinigamesGame from './screens/minigames/game.screen';
import UserGateScreen from '@screens/minigames/user-gate.screen';
import SubmitScoreScreen from '@screens/minigames/submit-score.screen';
import StaffScanner from './screens/staff-scanner.screen';
import ManualScreen from './screens/manual.screen';
import Credits from './screens/credits.screen';
import Music from './screens/music.screen';
import TermsScreen from './screens/terms.screen';
import PrivacyScreen from './screens/privacy.screen';

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
          <Route path='user' element={<UserGateScreen />} />
          <Route path='submit-score' element={<SubmitScoreScreen />} />
        </Route>
        <Route path='/manual' element={<ManualScreen />} />
        <Route path='/music' element={<Music />} />
        <Route path='/staff-scanner' element={<StaffScanner />} />
        <Route path='/credits' element={<Credits />} />
        <Route path='/terms' element={<TermsScreen />} />
        <Route path='/privacy' element={<PrivacyScreen />} />
      </Route>
    </Routes>
  );
}

export default App;
