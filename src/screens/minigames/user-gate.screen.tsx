import { useNavigate, useSearchParams } from 'react-router-dom';
import UsernameGate from '@components/username-gate.component.tsx';
import { usePlayerName } from '@hooks/use-player-name.hook.ts';

import { PATH_MINIGAMES } from '@utils/navigate.utils';

export default function UserGateScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { set } = usePlayerName();
  const ret = params.get('ret') || PATH_MINIGAMES;

  return (
    <div className='relative w-full px-4 py-6 min-h-[100svh]'>
      {/* Il componente ha già overlay full-bleed */}
      <UsernameGate
        onSubmit={(v) => {
          set(v);
          navigate(ret, { replace: true });
        }}
      />
    </div>
  );
}
