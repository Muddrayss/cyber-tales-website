// src/screens/home.screen.tsx
import { useContext } from 'react';

import { NavbarContext } from '../contexts/navbar.context';
import { PATH_MANUAL, PATH_MINIGAMES } from '@utils/navigate.utils';

type Feature = {
  title: string;
  text: string;
  emoji: string;
  href: string;
};

type Step = {
  n: string;
  title: string;
  text: string;
};

function FeatureCard({ f }: { f: Feature }) {
  return (
    <a
      href={f.href}
      className='group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10 dark:border-white/10'
      aria-label={f.title}
    >
      <div className='absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/20 via-fuchsia-400/20 to-amber-400/20 blur-2xl transition group-hover:scale-110' />
      <div className='relative'>
        <div className='mb-3 text-3xl leading-none'>{f.emoji}</div>
        <h3 className='text-xl font-semibold tracking-tight'>{f.title}</h3>
        <p className='mt-2 text-sm text-white/80'>{f.text}</p>
        <span className='mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-200'>
          Entra →
        </span>
      </div>
    </a>
  );
}

function StepItem({ s }: { s: Step }) {
  return (
    <div className='relative rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
      <div className='mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-sm font-bold'>
        {s.n}
      </div>
      <h4 className='text-base font-semibold'>{s.title}</h4>
      <p className='mt-1 text-sm text-white/80'>{s.text}</p>
    </div>
  );
}

export default function HomeScreen() {
  const features: Feature[] = [
    {
      title: 'Minigiochi',
      text: 'Sfide veloci e divertenti per imparare le regole base della cybersicurezza.',
      emoji: '🎮',
      href: PATH_MINIGAMES,
    },
    {
      title: 'Mobile APP',
      text: 'Storie interattive pensate per bambini, genitori e scuole.',
      emoji: '📱',
      href: '#',
    },
    {
      title: 'Manuale',
      text: 'Riassunti per ripassare i concetti sulla cybersicurezza.',
      emoji: '🛡️',
      href: PATH_MANUAL,
    },
  ];

  const steps: Step[] = [
    {
      n: '1',
      title: 'Scegli',
      text: 'Seleziona un minigioco o una storia in base all’età e al livello.',
    },
    {
      n: '2',
      title: 'Gioca',
      text: 'Completa i minigiochi e ottieni il punteggio più alto. Arriva in cima alla classifica!',
    },
    {
      n: '3',
      title: 'Applica',
      text: 'Metti in pratica: fai uso delle competenze acquisite nella vita reale.',
    },
  ];

  const { navbarHeight } = useContext(NavbarContext);

  return (
    <main className='main-container' style={{ marginTop: navbarHeight }}>
      {/* hero */}
      <section className='mx-auto max-w-7xl px-6 pb-10 pt-4 md:pb-16 md:pt-10'>
        <div className='grid items-center gap-10 md:grid-cols-2'>
          <div>
            <h1 className='main-title'>
              Impara la cybersicurezza
              <br />
              <span className='main-title-gradient'>giocando</span>.
            </h1>
            <p className='main-paragraph'>
              Mini-giochi, storie e missioni per tutte le età. Pensato per
              bambini, genitori e scuole: divertente, semplice, efficace.
            </p>

            <div className='mt-6 flex flex-wrap gap-3'>
              <a
                href='/minigames'
                className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110'
              >
                Inizia a giocare
              </a>
              <a
                href='/about'
                className='inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20'
              >
                Scopri di più
              </a>
            </div>

            <dl className='mt-6 grid grid-cols-3 gap-4 text-center text-xs md:text-sm'>
              <div className='rounded-xl bg-white/5 p-3 ring-1 ring-white/10'>
                <dt className='text-white/70'>Minigiochi</dt>
                <dd className='mt-1 font-bold'>3+</dd>
              </div>
              <div className='rounded-xl bg-white/5 p-3 ring-1 ring-white/10'>
                <dt className='text-white/70'>Difficoltà</dt>
                <dd className='mt-1 font-bold'>3 livelli</dd>
              </div>
              <div className='rounded-xl bg-white/5 p-3 ring-1 ring-white/10'>
                <dt className='text-white/70'>Pensato per</dt>
                <dd className='mt-1 font-bold'>Famiglie & Scuole</dd>
              </div>
            </dl>
          </div>

          {/* playful card preview */}
          <div className='relative'>
            <div className='absolute -inset-8 -z-10 animate-pulse rounded-[2.5rem] bg-gradient-to-br from-cyan-400/10 via-fuchsia-400/10 to-amber-400/10 blur-2xl' />
            <div className='rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 p-4 ring-1 ring-white/10'>
                  <div className='text-3xl'>🧠</div>
                  <p className='mt-2 text-sm font-semibold'>Quiz Phishing</p>
                  <p className='text-xs text-white/80'>
                    Riconosci email sospette e link trappola.
                  </p>
                </div>
                <div className='rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-400/10 p-4 ring-1 ring-white/10'>
                  <div className='text-3xl'>🔐</div>
                  <p className='mt-2 text-sm font-semibold'>Password Lab</p>
                  <p className='text-xs text-white/80'>
                    Crea password forti con passphrase.
                  </p>
                </div>
                <div className='rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-400/10 p-4 ring-1 ring-white/10 sm:col-span-2'>
                  <div className='text-3xl'>🛡️</div>
                  <p className='mt-2 text-sm font-semibold'>Privacy Patrol</p>
                  <p className='text-xs text-white/80'>
                    Imposta correttamente profili e permessi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className='mx-auto max-w-7xl px-6 pb-14'>
        <h2 className='text-center text-2xl font-bold tracking-tight md:text-3xl'>
          Cosa trovi in <span className='text-cyan-200'>CyberTales</span>
        </h2>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          {features.map((f) => (
            <FeatureCard key={f.title} f={f} />
          ))}
        </div>
      </section>

      {/* steps */}
      <section className='mx-auto max-w-7xl px-6 pb-16'>
        <div className='rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 md:p-8'>
          <h3 className='text-center text-xl font-semibold md:text-2xl'>
            Come funziona
          </h3>
          <div className='mt-6 grid gap-4 md:grid-cols-3'>
            {steps.map((s) => (
              <StepItem key={s.n} s={s} />
            ))}
          </div>
          <div className='mt-6 text-center'>
            <a
              href='/minigames'
              className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110'
            >
              Scegli un minigioco
            </a>
          </div>
        </div>
      </section>

      {/* testimonials / social proof */}
      <section className='mx-auto max-w-7xl px-6 pb-20 '>
        <h2 className='text-center text-2xl font-bold tracking-tight md:text-3xl'>
          Cosa dicono di <span className='text-cyan-200'>Noi</span>
        </h2>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          <figure className='rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
            <blockquote className='text-sm text-white/90'>
              “Mio figlio ha capito finalmente perché non deve cliccare su certi
              link. E si è pure divertito!”
            </blockquote>
            <figcaption className='mt-2 text-xs text-white/70'>
              — Genitore di Marco (8 anni)
            </figcaption>
          </figure>
          <figure className='rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
            <blockquote className='text-sm text-white/90'>
              “L’abbiamo usato in classe: bellissimo equilibrio tra gioco e
              contenuti.”
            </blockquote>
            <figcaption className='mt-2 text-xs text-white/70'>
              — Insegnante primaria
            </figcaption>
          </figure>
          <figure className='rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
            <blockquote className='text-sm text-white/90'>
              “Semplice da capire, immediato: WOW!”
            </blockquote>
            <figcaption className='mt-2 text-xs text-white/70'>
              — Chiara, 12 anni
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CTA footer */}
      <section className='relative mx-auto max-w-7xl px-6'>
        <div className='overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 p-6 shadow-2xl md:p-8'>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 40 40%22><g fill=%22white%22 fill-opacity=%220.08%22><circle cx=%225%22 cy=%225%22 r=%221%22/><circle cx=%2225%22 cy=%2215%22 r=%221%22/><circle cx=%2215%22 cy=%2230%22 r=%221%22/></g></svg>')] opacity-30" />
          <div className='relative grid items-center gap-4 md:grid-cols-[1fr_auto]'>
            <div>
              <h3 className='text-balance text-2xl font-bold md:text-3xl'>
                Pronto a iniziare?
              </h3>
              <p className='mt-1 text-sm text-white/90'>
                Entra nei minigiochi e sblocca i tuoi primi badge.
              </p>
            </div>
            <a
              href='/minigames'
              className='inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1020] transition hover:brightness-95'
            >
              Vai ai minigiochi
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
