import { useState, useMemo } from 'react';
import type { GameKey, Difficulty } from 'types/games.type.ts';
import { submitScoreWithEmail } from '@utils/score-submit.utils.ts';
import { PATH_PRIVACY, PATH_TERMS } from '@utils/navigate.utils';

interface ScoreFormProps {
  game: GameKey;
  difficulty: Difficulty;
  score: number;

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

const DIFFICULTY_COLORS = {
  junior: 'from-green-400 to-emerald-500',
  standard: 'from-blue-400 to-cyan-500',
  pro: 'from-orange-400 to-red-500',
};

const ScoreForm: React.FC<ScoreFormProps> = ({
  game,
  difficulty,
  score,
  onReplay,
  onExit,
  termsUrl = PATH_TERMS,
  privacyUrl = PATH_PRIVACY,
  submitLabel = 'Salva punteggio',
  replayLabel = 'Rigioca',
  exitLabel = 'Menu principale',
}) => {
  const [email, setEmail] = useState<string>('');
  const [agree, setAgree] = useState<boolean>(false);
  const [newsletter, setNewsletter] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const [touched, setTouched] = useState<{ email?: boolean }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const mustHaveEmail = newsletter;
  const canSubmit = useMemo(() => {
    if (!agree) return false;
    if (!email) return !mustHaveEmail;
    return emailValid;
  }, [agree, email, emailValid, mustHaveEmail]);

  const handleSubmit = async () => {
    if (!canSubmit || !email) return;

    setStatus('saving');
    const success = await submitScoreWithEmail({
      email,
      agree, // terms
      newsletter,
      game,
      difficulty,
      score,
      // optional:
      // description: 'Testo libero o lasciamo il default lato funzione'
    });
    setStatus(success ? 'saved' : 'error');

    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const difficultyGradient =
    DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.standard;

  return (
    <div className='bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4'>
      {/* Animated background */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'></div>
        <div
          className='absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <form
        className='relative w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20'
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        {/* Header with game info */}
        <div className='text-center mb-6'>
          {/* <div className='inline-block mb-4 text-5xl'>{gameEmoji}</div> */}
          <h2 className='text-3xl font-bold text-white mb-2'>
            Partita Completata!
          </h2>

          {/* Score display */}
          <div
            className={`inline-block mt-4 bg-gradient-to-r ${difficultyGradient} rounded-2xl p-6`}
          >
            <p className='text-sm text-white/80 mb-2'>Punteggio finale</p>
            <p
              className='text-5xl font-bold text-white'
              style={{ fontFamily: 'monospace' }}
            >
              {score.toLocaleString()}
            </p>
            <p className='text-sm text-white/80 mt-2'>
              Difficoltà:{' '}
              <span className='font-semibold capitalize'>{difficulty}</span>
            </p>
          </div>
        </div>

        {/* Save score section */}
        <div className='bg-black/20 rounded-2xl p-6 mb-6'>
          <h3 className='text-lg font-semibold text-white mb-3'>
            💾 Salva il tuo punteggio
          </h3>
          <p className='text-xs text-white/60 mb-4'>
            Facoltativo: inserisci l'email per salvare il punteggio.
          </p>

          {/* Email input */}
          <div className='mb-4'>
            <label
              htmlFor='score-email'
              className='block text-sm font-medium text-white/80 mb-2'
            >
              Email
              {newsletter && (
                <span className='text-cyan-400 ml-2'>
                  (richiesta per newsletter)
                </span>
              )}
            </label>
            <div className='relative'>
              <input
                id='score-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder='nome@example.com'
                disabled={status === 'saving' || status === 'saved'}
                className={`
                  w-full rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 
                  text-white placeholder:text-white/40 
                  border-2 transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${
                    email && !emailValid && touched.email
                      ? 'border-red-400/60 focus:border-red-400'
                      : 'border-white/20 focus:border-cyan-400/60'
                  }
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/20
                `}
              />
              {status === 'saved' && (
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  <span className='text-green-400 text-xl'>✓</span>
                </div>
              )}
            </div>
            {email && !emailValid && (touched.email || status === 'error') && (
              <p className='mt-2 text-xs text-red-400 flex items-center gap-1'>
                <span>⚠️</span> Inserisci un'email valida
              </p>
            )}
          </div>

          {/* Consents */}
          <div className='space-y-3'>
            <label className='flex items-start gap-3 cursor-pointer group'>
              <input
                type='checkbox'
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className='mt-0.5 w-5 h-5 rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-2 focus:ring-cyan-400/30'
              />
              <span className='text-sm text-white/80 group-hover:text-white transition-colors'>
                Accetto i{' '}
                <a
                  href={termsUrl}
                  className='text-cyan-400 underline underline-offset-2 hover:text-cyan-300'
                >
                  Termini di servizio
                </a>{' '}
                e la{' '}
                <a
                  href={privacyUrl}
                  className='text-cyan-400 underline underline-offset-2 hover:text-cyan-300'
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            <label className='flex items-start gap-3 cursor-pointer group'>
              <input
                type='checkbox'
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className='mt-0.5 w-5 h-5 rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-2 focus:ring-cyan-400/30'
              />
              <span className='text-sm text-white/80 group-hover:text-white transition-colors'>
                Iscrivimi alla newsletter per ricevere aggiornamenti sui nuovi
                giochi
                <span className='block text-xs text-white/50 mt-1'>
                  (facoltativo, puoi cancellarti in qualsiasi momento)
                </span>
              </span>
            </label>
          </div>

          {!agree && (
            <div className='mt-3 bg-red-500/20 border border-red-400/40 rounded-lg p-2'>
              <p className='text-xs text-red-300 flex items-center gap-1'>
                Devi accettare i termini per salvare il punteggio
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className='space-y-3'>
          {/* Primary action - Save */}
          <button
            type='submit'
            disabled={!canSubmit || status === 'saving' || status === 'saved'}
            className={`
              w-full py-4 rounded-xl font-bold text-lg
              transition-all transform
              ${
                canSubmit && status !== 'saving' && status !== 'saved'
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-xl hover:shadow-2xl hover:scale-105'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }
            `}
          >
            {status === 'saving' ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='animate-spin'>⏳</span> Salvataggio...
              </span>
            ) : status === 'saved' ? (
              <span className='flex items-center justify-center gap-2'>
                ✅ Salvato con successo!
              </span>
            ) : (
              <>🏆 {submitLabel}</>
            )}
          </button>

          {/* Secondary actions */}
          <div className='grid grid-cols-2 gap-3'>
            <button
              type='button'
              onClick={onReplay}
              className='py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm text-white border border-cyan-400/30 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all transform hover:scale-105'
            >
              🔄 {replayLabel}
            </button>

            <button
              type='button'
              onClick={onExit}
              className='py-3 rounded-xl font-semibold bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105'
            >
              🏠 {exitLabel}
            </button>
          </div>
        </div>

        {/* Status messages */}
        {status === 'error' && (
          <div className='mt-4 bg-red-500/20 border border-red-400/40 rounded-lg p-3'>
            <p className='text-sm text-red-300 flex items-center gap-2'>
              <span>❌</span> Errore nel salvataggio. Riprova più tardi.
            </p>
          </div>
        )}

        {!email && status === 'idle' && (
          <p className='mt-4 text-center text-xs text-white/50'>
            💡 Puoi continuare senza salvare usando i pulsanti qui sopra
          </p>
        )}
      </form>

      {/* Success animation */}
      {showSuccess && (
        <div className='fixed inset-0 pointer-events-none flex items-center justify-center z-50'>
          <div className='bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce'>
            <p className='text-xl font-bold'>
              🎉 Punteggio salvato con successo!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreForm;
