/* components/score-form.component.tsx */
import { useState, useMemo } from 'react';
import type { GameKey, Difficulty } from 'types/games.type.ts';
import { submitScore } from '@utils/game.utils.ts';

interface ScoreFormProps {
  game: GameKey;
  difficulty: Difficulty;
  score: number;

  // Nuovi (opzionali) per UX completa — retro-compatibili
  onReplay?: () => void;
  onLeaderboard?: () => void;
  onExit?: () => void;

  termsUrl?: string;
  privacyUrl?: string;

  submitLabel?: string;
  replayLabel?: string;
  leaderboardLabel?: string;
  exitLabel?: string;
}

const ScoreForm: React.FC<ScoreFormProps> = ({
  game,
  difficulty,
  score,
  onReplay,
  onLeaderboard,
  onExit,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
  submitLabel = 'Invia e salva',
  replayLabel = 'Rigioca',
  exitLabel = 'Esci',
}) => {
  const [email, setEmail] = useState<string>('');
  const [agree, setAgree] = useState<boolean>(false);
  const [newsletter, setNewsletter] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const [touched, setTouched] = useState<{ email?: boolean }>({});

  const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const mustHaveEmail = newsletter; // newsletter => serve email
  const canSubmit = useMemo(() => {
    if (!agree) return false;
    if (!email) return !mustHaveEmail; // ok solo se newsletter non spuntata
    return emailValid;
  }, [agree, email, emailValid, mustHaveEmail]);

  const handleSubmit = async () => {
    // manteniamo il comportamento “opzionale”: se non compili, non invii
    if (!canSubmit || !email) return;

    setStatus('saving');
    const record = { game, difficulty, score, email, newsletter };
    const success = await submitScore(record);
    setStatus(success ? 'saved' : 'error');
  };

  return (
    <form
      className='rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 mx-auto sm:max-w-xl px-6 pb-8 pt-4 md:pb-10 md:pt-8'
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      noValidate
    >
      <h2 className='text-base md:text-lg font-semibold'>Salva il punteggio</h2>
      <p className='mt-1 text-xs text-white/70'>
        Facoltativo: inserisci l’email per salvare il punteggio e ricevere
        aggiornamenti se vuoi.
      </p>

      {/* Email */}
      <div className='mt-4'>
        <label htmlFor='score-email' className='block text-sm font-semibold'>
          Email{' '}
          {newsletter && (
            <span className='text-white/70'>(richiesta per newsletter)</span>
          )}
        </label>
        <input
          id='score-email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder='nome@gmail.com'
          disabled={status === 'saving' || status === 'saved'}
          className={[
            'mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 placeholder:text-white/60 disabled:opacity-60',
            email && !emailValid
              ? 'ring-red-400/60 focus:ring-red-400/80'
              : 'ring-white/15 focus:ring-white/30',
          ].join(' ')}
        />
        {email && !emailValid && (touched.email || status === 'error') && (
          <p className='mt-2 text-xs text-red-300'>
            Inserisci un’email valida.
          </p>
        )}
      </div>

      {/* Consensi */}
      <fieldset className='mt-4'>
        <legend className='text-sm font-semibold'>Consensi</legend>
        <div className='mt-2 space-y-2'>
          <label className='flex gap-3'>
            <input
              type='checkbox'
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className='mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-white/30'
            />
            <span className='text-sm'>
              Accetto{' '}
              <a href={termsUrl} className='underline underline-offset-2'>
                Termini
              </a>{' '}
              e{' '}
              <a href={privacyUrl} className='underline underline-offset-2'>
                Privacy
              </a>
              .
            </span>
          </label>

          <label className='flex gap-3'>
            <input
              type='checkbox'
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className='mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-white/30'
            />
            <span className='text-sm'>
              Iscrivimi alla newsletter (facoltativo, revocabile in ogni
              momento).
            </span>
          </label>

          {!agree && (
            <p className='text-xs text-red-300'>
              Devi accettare Termini e Privacy per inviare.
            </p>
          )}
        </div>
      </fieldset>

      {/* Barra azioni */}
      <div className='mt-6 border-t border-white/10 pt-4 flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-between'>
        {/* Secondarie */}
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={onReplay}
            className='rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/20'
          >
            {replayLabel}
          </button>
          <button
            type='button'
            onClick={onExit}
            className='rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/20'
          >
            {exitLabel}
          </button>
        </div>

        {/* Primaria */}
        <button
          type='submit'
          disabled={!canSubmit || status === 'saving' || status === 'saved'}
          className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-3 text-sm font-extrabold shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-50'
        >
          {status === 'saving'
            ? 'Salvataggio…'
            : status === 'saved'
            ? 'Salvato!'
            : submitLabel}
        </button>
      </div>

      {/* esiti */}
      {status === 'error' && (
        <p className='mt-2 text-xs text-red-400'>
          Errore nel salvataggio. Riprova più tardi.
        </p>
      )}
      {status === 'saved' && (
        <p className='mt-2 text-xs text-green-300'>
          Punteggio salvato con successo!
        </p>
      )}
      {!email && (
        <p className='mt-2 text-xs text-white/60'>
          Puoi anche evitare di inviare: usa i pulsanti qui sopra per
          continuare.
        </p>
      )}
    </form>
  );
};

export default ScoreForm;
