// src/screens/about.screen.tsx
import { useContext } from 'react';
import { PATH_MINIGAMES, PATH_CREDITS } from '@utils/navigate.utils';
import { NavbarContext } from '@contexts/navbar.context';

type Qna = { q: string; a: string };
type Stat = { label: string; value: string; note?: string };

function StatCard({ s }: { s: Stat }) {
  return (
    <div className='rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
      <p className='text-xs text-white/70'>{s.label}</p>
      <p className='mt-1 text-xl font-semibold'>{s.value}</p>
      {s.note && <p className='mt-1 text-xs text-white/70'>{s.note}</p>}
    </div>
  );
}

function QnaItem({ q, a }: Qna) {
  return (
    <div className='group rounded-2xl bg-white/5 p-4 ring-1 ring-white/10'>
      <summary className='cursor-pointer list-none text-sm font-semibold marker:content-none'>
        {q}
      </summary>
      <p className='mt-2 text-sm text-white/80'>{a}</p>
    </div>
  );
}

export default function AboutScreen() {
  const { navbarHeight } = useContext(NavbarContext);

  const stats: Stat[] = [
    { label: 'Target', value: 'Bambini, Famiglie, Scuole' },
    { label: 'Formati', value: 'Minigiochi, Storie, Manuali' },
    { label: 'Focus', value: 'Phishing, Password, Privacy' },
  ];

  const qna: Qna[] = [
    {
      q: 'Perché CyberTales?',
      a: 'Per rendere la cybersicurezza semplice e concreta: giochi brevi, storie chiare e manuali sintetici che trasformano teoria in abitudini.',
    },
    {
      q: 'Serve un account o dati personali?',
      a: 'Per navigare no. Per app/minigiochi raccogliamo solo il minimo indispensabile per farli funzionare.',
    },
    {
      q: 'È adatto alla classe?',
      a: 'Sì. Stiamo preparando suggerimenti didattici e percorsi per età. Scrivici per collaborazioni.',
    },
  ];

  return (
    <main className='main-container' style={{ marginTop: navbarHeight }}>
      <section className='mx-auto max-w-7xl px-6 pb-10 pt-4 md:pb-16 md:pt-10'>
        <h1 className='main-title'>
          Chi&nbsp;
          <span className='main-title-gradient'>siamo?</span>
        </h1>
      </section>

      {/* Missione + Link rapidi (coerenza visuale con le card della Home) */}
      <section className='mx-auto max-w-7xl px-6 pb-14'>
        <div className='rounded-3xl bg-white/5 p-6 ring-1 ring-white/10'>
          <h2 className='text-xl md:text-2xl font-bold'>Missione</h2>
          <p className='mt-2 text-sm md:text-base text-white/80'>
            Tradurre concetti complessi di sicurezza in esperienze brevi, chiare
            e giocabili. Ogni contenuto nasce per essere "capito" e "messo in
            pratica" subito: in casa, a scuola, sui social. Valorizziamo
            coerenza di linguaggio, pattern ripetibili e feedback immediati.
          </p>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            {stats.map((s) => (
              <StatCard key={s.label} s={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Metodo: tre card sintetiche (niente “come funziona” duplicato) */}
      <section className='mx-auto max-w-7xl px-6 pb-14 flex flex-col md:flex-row gap-3'>
        <div className='rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
          <h3 className='text-base font-semibold'>1) Micro-esperienze</h3>
          <p className='mt-1 text-sm text-white/80'>
            Sessioni brevi con obiettivi chiari e feedback immediato per
            mantenere la motivazione.
          </p>
        </div>
        <div className='md:mt-0 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
          <h3 className='text-base font-semibold'>
            2) Dalla storia all’azione
          </h3>
          <p className='mt-1 text-sm text-white/80'>
            Storie + minigiochi collegati a piccole missioni da fare a casa o in
            classe.
          </p>
        </div>
        <div className='md:mt-0 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
          <h3 className='text-base font-semibold'>3) Ripasso semplice</h3>
          <p className='mt-1 text-sm text-white/80'>
            Manuali e schede sintetiche per fissare le regole senza sovraccarico
            cognitivo.
          </p>
        </div>
      </section>

      {/* Roadmap & Collaborazioni */}
      <section className='mx-auto max-w-7xl px-6 pb-14'>
        <div className='rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
          <h3 className='text-base font-semibold'>Roadmap</h3>
          <ul className='mt-2 list-disc pl-5 text-sm text-white/80'>
            <li>Nuovi minigiochi: privacy social, impronta digitale.</li>
            <li>
              Modalità classe: suggerimenti didattici e progressi condivisi.
            </li>
            <li>Badge e percorsi per fasce d’età.</li>
          </ul>
        </div>
        <div className='mt-3 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10'>
          <h3 className='text-base font-semibold'>Collabora con noi</h3>
          <p className='mt-1 text-sm text-white/80'>
            Sei una scuola, un educatore o un partner? Scrivici: progettiamo
            percorsi su misura.
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <a
              href='mailto:info@cybertales.it'
              className='rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/20'
            >
              ✉️ info@cybertales.it
            </a>
            <a
              href={PATH_CREDITS}
              className='rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:brightness-110'
            >
              👤 Team & Crediti
            </a>
          </div>
        </div>
      </section>

      {/* FAQ compatta */}
      <section className='mx-auto max-w-7xl px-6 pb-20'>
        <h2 className='text-xl md:text-2xl font-bold'>FAQ</h2>
        <div className='mt-3 grid gap-3 md:grid-cols-3'>
          {qna.map((item) => (
            <QnaItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* CTA finale (coerente con Home ma non copia/incolla) */}
      <section className='relative mx-auto max-w-7xl px-6'>
        <div className='rounded-3xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 p-6 shadow-2xl'>
          <div className='grid items-center gap-4 md:grid-cols-[1fr_auto]'>
            <div>
              <h3 className='text-lg md:text-xl font-bold'>
                Pronto a iniziare?
              </h3>
              <p className='mt-1 text-sm text-white/90'>
                Scegli un minigioco e sblocca i primi badge.
              </p>
            </div>
            <a
              href={PATH_MINIGAMES}
              className='inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#0b1020] hover:brightness-95'
            >
              Vai ai minigiochi
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
