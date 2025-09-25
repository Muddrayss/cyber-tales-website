import { useContext } from 'react';

// contexts
import { NavbarContext } from '@contexts/navbar.context';

export default function PrivacyScreen() {
  const { navbarHeight } = useContext(NavbarContext);

  return (
    <div className='mx-auto max-w-4xl px-6 py-12 text-white'>
      <h1
        className='text-4xl font-extrabold mb-6'
        style={{ marginTop: navbarHeight }}
      >
        Informativa sul Trattamento dei Dati (art. 13 GDPR)
      </h1>
      <p className='text-sm opacity-80 mb-8'>
        Ultimo aggiornamento: 25 settembre 2025
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        1. Titolare del trattamento
      </h2>
      <p className='mb-4'>
        <strong>ElathonGames</strong> – Email:{' '}
        <strong>elathongames@gmail.com</strong> (il “<strong>Titolare</strong>
        ”).
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>2. Dati trattati</h2>
      <ul className='list-disc pl-6 space-y-2 mb-4'>
        <li>
          <strong>Email</strong> (inserita nel modulo “salva punteggio”).
        </li>
        <li>
          <strong>Preferenze</strong>: accettazione Termini/Privacy; iscrizione
          alla newsletter (opt-in).
        </li>
        <li>
          <strong>Metadati punteggio</strong>: gioco, difficoltà, punteggio;{' '}
          <em>qr_token</em> per il QR inviato via email.
        </li>
        <li>
          <strong>Nickname locale</strong>: salvato <em>solo</em> sul
          dispositivo (localStorage), non trasmesso al Titolare.
        </li>
      </ul>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        3. Finalità e basi giuridiche
      </h2>
      <ul className='list-disc pl-6 space-y-4 mb-4'>
        <li>
          <strong>Invio riepilogo punteggio via email</strong> (gioco,
          difficoltà, QR). Base giuridica: esecuzione di misure
          precontrattuali/contrattuali richieste dall’utente (art. 6(1)(b)
          GDPR).
        </li>
        <li>
          <strong>Iscrizione alla newsletter</strong> del Titolare e/o
          dell’associazione partner <strong>Fondazione CR Firenze</strong> (se
          spuntata). Base giuridica: <strong>consenso</strong> (art. 6(1)(a)
          GDPR); il consenso deve essere libero, specifico, informato e
          revocabile in qualsiasi momento; la disiscrizione deve essere semplice
          (link “unsubscribe” in ogni email).
        </li>
      </ul>

      <h2 className='text-2xl font-bold mt-8 mb-3'>4. Conferimento dei dati</h2>
      <p className='mb-4'>
        L’email è necessaria per inviare il riepilogo punteggio. L’iscrizione
        alla newsletter è <strong>facoltativa</strong> e richiede un consenso
        separato.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        5. Destinatari e categorie di destinatari
      </h2>
      <ul className='list-disc pl-6 space-y-2 mb-4'>
        <li>
          <strong>Fornitore infrastruttura (Supabase)</strong>, nominato
          Responsabile ex art. 28 GDPR (DPA disponibile).
        </li>
        <li>
          <strong>Associazione partner</strong> <em>Fondazione CR Firenze</em>:
          riceverà l’email <strong>solo</strong> se presti consenso alla
          newsletter; agisce come <em>autonomo titolare</em> per l’invio delle
          proprie comunicazioni.
        </li>
        <li>
          Fornitori di email delivery (Resend), in qualità di responsabili.
        </li>
      </ul>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        6. Trasferimenti extra-UE e conservazione
      </h2>
      <p className='mb-4'>
        I dati sono conservati nell’infrastruttura Supabase in{' '}
        <strong>Francia</strong>. Eventuali trasferimenti extra-UE avvengono con
        adeguate garanzie (es. SCC).
      </p>
      <p className='mb-4'>
        I punteggi e i metadati correlati sono conservati per il tempo
        necessario alle finalità dichiarate e/o fino a richiesta di
        cancellazione; i consensi newsletter fino a revoca.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>7. Sicurezza</h2>
      <p className='mb-4'>
        Applichiamo misure tecniche e organizzative adeguate.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        8. Diritti dell’interessato
      </h2>
      <p className='mb-4'>
        Hai diritto di accesso, rettifica, cancellazione, limitazione,
        portabilità e opposizione; puoi revocare in ogni momento i consensi
        prestati, senza pregiudicare la liceità del trattamento basata sul
        consenso prima della revoca. Puoi inoltre proporre reclamo al Garante
        per la Protezione dei Dati Personali.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>
        9. Modalità di esercizio dei diritti
      </h2>
      <p className='mb-4'>
        Per esercitare i diritti o per qualunque informazione, scrivi a{' '}
        <strong>elathongames@gmail.com</strong>. Per la newsletter, usa anche il link
        “cancellazione” presente in fondo ad ogni email.
      </p>

      <h2 className='text-2xl font-bold mt-8 mb-3'>10. Aggiornamenti</h2>
      <p className='mb-4'>
        Questa informativa può essere aggiornata. Le modifiche saranno
        pubblicate su questa pagina.
      </p>
    </div>
  );
}
