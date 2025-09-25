import { useContext } from 'react';

// contexts
import { NavbarContext } from '@contexts/navbar.context';

import { PATH_PRIVACY } from '@utils/navigate.utils';

export default function TermsScreen() {
  const { navbarHeight } = useContext(NavbarContext);

  return (
    <div className='mx-auto max-w-4xl px-6 py-12 text-white'>
      <h1
        className='text-4xl font-extrabold mb-6'
        style={{ marginTop: navbarHeight }}
      >
        Termini di Servizio
      </h1>
      <p className='text-sm opacity-80 mb-8'>
        Ultimo aggiornamento: 25 settembre 2025
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>1. Chi siamo</h2>
      <p className='mb-4'>
        Il servizio “CyberTales” (minigiochi, sito e funzionalità connesse) è
        gestito da <strong>ElathonGames</strong>, email{' '}
        <strong>elathongames@gmail.com</strong> (di seguito, “
        <strong>Titolare</strong>”).
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>2. Oggetto del servizio</h2>
      <p className='mb-4'>
        Il sito offre minigiochi e funzionalità annesse (es. salvataggio
        punteggi, invio email del punteggio all’utente, iscrizione facoltativa a
        newsletter). L’uso è consentito senza registrazione account; per alcune
        funzioni (es. invio punteggio via email) è richiesto l’inserimento
        dell’indirizzo email.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>3. Regole d’uso</h2>
      <ul className='list-disc pl-6 space-y-2 mb-4'>
        <li>Non utilizzare il sito in modo illecito o lesivo di terzi.</li>
        <li>
          Non tentare di aggirare sicurezza, limitazioni tecniche o manipolare
          classifiche/punteggi.
        </li>
        <li>
          Non caricare contenuti illegali, offensivi o che violino diritti di
          terzi.
        </li>
      </ul>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        4. Proprietà intellettuale
      </h2>
      <p className='mb-4'>
        Tutti i contenuti (codice, grafica, testi, loghi, asset) sono del
        Titolare o dei rispettivi licenzianti. È vietata la riproduzione non
        autorizzata.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        5. Punteggi e funzionalità
      </h2>
      <ul className='list-disc pl-6 space-y-2 mb-4'>
        <li>
          L’utente può inserire l’email per ricevere il riepilogo del punteggio
          (gioco e difficoltà).
        </li>
        <li>
          L’utente può spuntare opzionalmente la casella newsletter: in tal caso
          la sua email potrà essere comunicata all’associazione partner{' '}
          <strong>Fondazione CR Firenze</strong> che gestirà le proprie
          comunicazioni come autonomo titolare.
        </li>
        <li>
          Il nickname mostrato nell’interfaccia è salvato{' '}
          <strong>solo localmente</strong> nel browser e non viene inviato ai
          nostri server.
        </li>
      </ul>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        6. Limitazioni e responsabilità
      </h2>
      <p className='mb-4'>
        Il servizio è fornito “così com’è”. Nei limiti massimi di legge, il
        Titolare non risponde per indisponibilità, perdita dati non imputabile a
        colpa grave o dolo, o danni indiretti derivanti dall’uso del sito.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>7. Modifiche</h2>
      <p className='mb-4'>
        Il Titolare può modificare i presenti Termini. Le modifiche saranno
        efficaci dalla pubblicazione. L’uso successivo del sito implica
        accettazione delle modifiche.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        8. Legge applicabile e foro
      </h2>
      <p className='mb-4'>
        I presenti Termini sono regolati dalla legge italiana. Per ogni
        controversia è competente in via esclusiva il Foro di{' '}
        <strong>Firenze</strong>.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>9. Privacy</h2>
      <p className='mb-4'>
        Il trattamento dei dati personali è descritto nell’{' '}
        <a
          href={PATH_PRIVACY}
          className='text-cyan-400 underline underline-offset-2'
        >
          Informativa Privacy
        </a>
        .
      </p>
    </div>
  );
}
