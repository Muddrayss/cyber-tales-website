// src/screens/manual.screen.tsx
import React, { useContext, useMemo, useEffect } from 'react';
import { NavbarContext } from '../contexts/navbar.context';

type TocItem = { id: string; title: string };

function Section({
  id,
  title,
  navbarHeight,
  children,
}: {
  id: string;
  title: string;
  navbarHeight: number;
  children: React.ReactNode;
}) {
  return (
    <article
      id={id}
      // scroll-margin per non far "finire" i titoli sotto la navbar
      style={{ scrollMarginTop: navbarHeight + 24 }}
      className='rounded-3xl bg-white/5 p-6 ring-1 ring-white/10'
    >
      <h2 className='text-xl md:text-2xl font-bold'>{title}</h2>
      <div className='mt-2 space-y-3 text-sm md:text-base text-white/80'>
        {children}
      </div>
    </article>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='mt-3'>
      <h3 className='text-base font-semibold'>{title}</h3>
      <div className='mt-1 space-y-2 text-sm md:text-base text-white/80'>
        {children}
      </div>
    </div>
  );
}

const ManualScreen: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--nav-offset',
      `${navbarHeight + 16}px`
    );
  }, [navbarHeight]);

  const toc: TocItem[] = useMemo(
    () => [
      { id: 'introduzione', title: 'Introduzione' },
      { id: 'phishing', title: 'Phishing' },
      { id: 'https', title: 'Navigazione sicura (HTTPS)' },
      { id: 'password', title: 'Password' },
      { id: '2fa', title: 'Autenticazione a due fattori (2FA)' },
      { id: 'malware', title: 'Malware' },
      { id: 'antivirus-firewall', title: 'Antivirus & Firewall' },
      { id: 'social-engineering', title: 'Ingegneria sociale' },
      { id: 'deep-dark-web', title: 'Deep Web & Dark Web' },
    ],
    []
  );

  return (
    <main
      className='main-container text-white overflow-visible'
      style={{ marginTop: navbarHeight }}
    >
      {/* Intro page header */}
      <section className='mx-auto max-w-7xl px-6 pb-8 pt-4 md:pb-10 md:pt-8'>
        <h1 className='main-title'>
          Leggi il nostro&nbsp;
          <br />
          <span className='main-title-gradient'>
            Manuale sulla Cybersicurezza
          </span>
        </h1>
        <p className='main-paragraph'>
          Riassunti chiari per ripassare i concetti di cybersicurezza visti in
          minigiochi e storie. Poca teoria, tanta pratica.
        </p>
      </section>

      {/* Layout con TOC a sinistra (sticky su md+) e contenuti a destra */}
      <section className='mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-[260px_1fr]'>
        {/* TOC desktop */}
        <aside className='sticky top-[calc(var(--nav-offset,0px))] hidden self-start md:block'>
          <nav
            aria-label='Indice manuale'
            className='rounded-2xl bg-white/5 p-3 ring-1 ring-white/10'
          >
            <p className='px-2 pb-2 text-xs text-white/70'>Indice</p>
            <ul className='space-y-1 text-sm'>
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className='block rounded-lg px-2 py-1 hover:bg-white/10'
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* TOC mobile */}
        <div className='md:hidden'>
          <nav
            aria-label='Indice manuale'
            className='no-scrollbar -mx-2 flex gap-2 overflow-x-auto px-2 pb-2'
          >
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className='whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15'
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Contenuti */}
        <div className='flex flex-col gap-6'>
          <Section
            id='introduzione'
            title='Introduzione'
            navbarHeight={navbarHeight}
          >
            <p>
              Benvenuto nel manuale di sicurezza online! Qui trovi i concetti
              chiave che hai incontrato nell’app e nei minigiochi, organizzati
              per argomenti e con consigli pratici da mettere subito in atto.
            </p>
          </Section>

          <Section id='phishing' title='Phishing' navbarHeight={navbarHeight}>
            <SubSection title='Cos’è il phishing?'>
              <p>
                Tecniche per ingannarti e farti rivelare dati sensibili
                (password, carte, ecc.). Arrivano via email, SMS o siti falsi
                che imitano quelli legittimi.
              </p>
            </SubSection>
            <SubSection title='Come riconoscerlo'>
              <ul className='list-disc pl-5'>
                <li>
                  <strong>Mittente sospetto:</strong> indirizzo simile ma non
                  identico al vero.
                </li>
                <li>
                  <strong>Errori evidenti:</strong> grammatica e tono
                  incoerenti.
                </li>
                <li>
                  <strong>Link/Allegati:</strong> evita click e download non
                  richiesti.
                </li>
                <li>
                  <strong>Urgenza artificiale:</strong> “subito o perdi
                  l’account”.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Prevenzione'>
              <ul className='list-disc pl-5'>
                <li>
                  <strong>Verifica:</strong> contatta la fonte ufficiale da
                  canali indipendenti.
                </li>
                <li>
                  <strong>Non cliccare:</strong> apri l’area clienti da URL
                  digitato a mano.
                </li>
                <li>
                  <strong>Filtri anti-phishing:</strong> aiutano a bloccare
                  messaggi e siti pericolosi.
                </li>
              </ul>
            </SubSection>
          </Section>

          <Section
            id='https'
            title='Navigazione sicura (HTTPS)'
            navbarHeight={navbarHeight}
          >
            <SubSection title='Cos’è HTTPS?'>
              <p>
                Protocollo che cifra i dati tra browser e sito, riducendo il
                rischio di intercettazioni e manomissioni.
              </p>
            </SubSection>
            <SubSection title='Perché è importante'>
              <ul className='list-disc pl-5'>
                <li>
                  <strong>Protezione dati:</strong> riduce accessi non
                  autorizzati.
                </li>
                <li>
                  <strong>Autenticità:</strong> aiuta a riconoscere siti
                  legittimi.
                </li>
                <li>
                  <strong>Integrità:</strong> evita che le info vengano alterate
                  in transito.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Come riconoscere un sito sicuro'>
              <ul className='list-disc pl-5'>
                <li>
                  URL che inizia con <code>https://</code>.
                </li>
                <li>Icona del lucchetto nella barra degli indirizzi.</li>
                <li>Certificato valido (verificabile dal lucchetto).</li>
              </ul>
            </SubSection>
          </Section>

          <Section id='password' title='Password' navbarHeight={navbarHeight}>
            <SubSection title='Creare password robuste'>
              <ul className='list-disc pl-5'>
                <li>
                  <strong>Lunghezza:</strong> preferisci passphrase (3–4 parole
                  non correlate).
                </li>
                <li>
                  <strong>Varietà:</strong> lettere maiuscole/minuscole, numeri
                  e simboli quando ha senso.
                </li>
                <li>
                  <strong>Unicità:</strong> una password diversa per ogni sito.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Gestione'>
              <ul className='list-disc pl-5'>
                <li>
                  <strong>Password manager:</strong> memorizza in modo sicuro e
                  genera credenziali forti.
                </li>
                <li>
                  <strong>Aggiornamenti mirati:</strong> cambia subito dopo
                  violazioni o condivisioni sospette.
                </li>
              </ul>
            </SubSection>
          </Section>

          <Section
            id='2fa'
            title='Autenticazione a due fattori (2FA)'
            navbarHeight={navbarHeight}
          >
            <SubSection title='Cos’è'>
              <p>
                Un secondo fattore oltre la password (codice, app, chiave
                fisica) che blocca accessi non autorizzati anche se la password
                è conosciuta.
              </p>
            </SubSection>
            <SubSection title='Vantaggi'>
              <ul className='list-disc pl-5'>
                <li>
                  Sicurezza aggiuntiva contro phishing e furti credenziali.
                </li>
                <li>Facile da configurare su molti servizi.</li>
              </ul>
            </SubSection>
            <SubSection title='Come attivarla'>
              <ul className='list-disc pl-5'>
                <li>Apri le impostazioni di sicurezza del servizio.</li>
                <li>
                  Scegli SMS, app autenticatore o chiave hardware (preferibile).
                </li>
                <li>Salva i codici di backup in luogo sicuro.</li>
              </ul>
            </SubSection>
          </Section>

          <Section id='malware' title='Malware' navbarHeight={navbarHeight}>
            <SubSection title='Cos’è'>
              <p>
                Software dannoso progettato per danneggiare o rubare dati:
                virus, worm, trojan, ransomware, spyware, e altro.
              </p>
            </SubSection>
            <SubSection title='Tipi comuni'>
              <ul className='list-disc pl-5'>
                <li>
                  <strong>Virus:</strong> infettano file ed eseguibili.
                </li>
                <li>
                  <strong>Worm:</strong> si replicano via rete.
                </li>
                <li>
                  <strong>Trojan:</strong> si mascherano da software legittimo.
                </li>
                <li>
                  <strong>Ransomware:</strong> cifrano i dati chiedendo
                  riscatto.
                </li>
                <li>
                  <strong>Spyware:</strong> spiano attività e rubano info.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Prevenzione'>
              <ul className='list-disc pl-5'>
                <li>Antivirus aggiornato e scansioni periodiche.</li>
                <li>Sistema e app sempre aggiornati.</li>
                <li>Scarica solo da fonti affidabili.</li>
                <li>Backup regolari dei dati importanti.</li>
              </ul>
            </SubSection>
          </Section>

          <Section
            id='antivirus-firewall'
            title='Antivirus & Firewall'
            navbarHeight={navbarHeight}
          >
            <SubSection title='Antivirus'>
              <p>
                Rileva e rimuove malware; monitora in tempo reale file e
                download.
              </p>
            </SubSection>
            <SubSection title='Firewall'>
              <p>
                Controlla il traffico di rete in entrata/uscita e blocca
                connessioni non autorizzate.
              </p>
            </SubSection>
            <SubSection title='Perché servono entrambi'>
              <ul className='list-disc pl-5'>
                <li>Protezione da minacce note e comportamenti sospetti.</li>
                <li>Barriera di rete + controllo a livello di file/app.</li>
              </ul>
            </SubSection>
          </Section>

          <Section
            id='social-engineering'
            title='Ingegneria sociale'
            navbarHeight={navbarHeight}
          >
            <SubSection title='Cos’è'>
              <p>
                Manipolazione psicologica per ottenere informazioni o accessi:
                sfrutta fiducia, paura o curiosità.
              </p>
            </SubSection>
            <SubSection title='Tecniche comuni'>
              <ul className='list-disc pl-5'>
                <li>Phishing (email/SMS/DM falsi).</li>
                <li>Pretexting (fingersi tecnici/autorità).</li>
                <li>Vishing (telefonate ingannevoli).</li>
                <li>Raccolta info dai social per attacchi mirati.</li>
              </ul>
            </SubSection>
            <SubSection title='Difese'>
              <ul className='list-disc pl-5'>
                <li>Verifica identità e richieste fuori canale.</li>
                <li>Formazione continua e segnalazioni interne.</li>
              </ul>
            </SubSection>
          </Section>

          <Section
            id='deep-dark-web'
            title='Deep Web & Dark Web'
            navbarHeight={navbarHeight}
          >
            <SubSection title='Definizioni rapide'>
              <ul className='list-disc pl-5'>
                <li>
                  <strong>Deep Web:</strong> contenuti non indicizzati (es.
                  intranet, home banking).
                </li>
                <li>
                  <strong>Dark Web:</strong> porzione accessibile con software
                  dedicati (es. Tor), può ospitare attività illegali.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Avvertenze'>
              <ul className='list-disc pl-5'>
                <li>Rischi legali e di sicurezza elevati.</li>
                <li>
                  Non accedere senza consapevolezza e protezioni adeguate.
                </li>
              </ul>
            </SubSection>
          </Section>
        </div>
      </section>
    </main>
  );
};

export default ManualScreen;
