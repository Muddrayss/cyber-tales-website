import React, { useState } from 'react';

type Props = {
  onSubmit: (name: string) => void;
  title?: string;
  ctaLabel?: string;
};

const USERNAME_RE = /^[a-zA-Z0-9_\-]{3,20}$/;

const UsernameGate: React.FC<Props> = ({ onSubmit, title, ctaLabel }) => {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  const v = name.trim();
  const valid = USERNAME_RE.test(v);

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSubmit(v);
  };

  return (
    <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
      <div className='w-full h-full sm:h-auto flex flex-col justify-center sm:max-w-md rounded-3xl bg-white/5 p-6 ring-1 ring-white/10'>
        <h2 className='text-base md:text-lg font-semibold text-white/70'>
          {title ?? 'Inserisci un nome utente per giocare'}
        </h2>
        <p className='mt-1 text-xs text-white/40'>
          Il nome ha solo scopo identificativo e non verrà salvato
          permanentemente.
        </p>

        <div className='mt-4'>
          <label
            htmlFor='username'
            className='block text-sm font-semibold text-white/70'
          >
            Nome utente
          </label>
          <input
            id='username'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            type='text'
            maxLength={20}
            placeholder='Es. CyberKid_07'
            className={[
              'mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 placeholder:text-white/40 text-white/70',
              valid || !touched
                ? 'ring-white/15 focus:ring-white/30'
                : 'ring-red-400/50 focus:ring-red-400/70',
            ].join(' ')}
            autoFocus
          />
          {!valid && touched && (
            <p className='mt-2 text-xs text-red-300'>
              Usa 3–20 caratteri: lettere, numeri, “_” o “-”.
            </p>
          )}
        </div>

        <button
          onClick={submit}
          disabled={!valid}
          className='mt-4 w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-3 text-sm font-extrabold shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-50'
        >
          {ctaLabel ?? 'Comincia a giocare'}
        </button>
      </div>
    </div>
  );
};

export default UsernameGate;
