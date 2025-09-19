import React, { useContext } from 'react';

import { NavbarContext } from '../contexts/navbar.context';

const ManualScreen: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  // const sections = [
  //   { id: 'introduction', title: 'Introduzione' },
  //   { id: 'phishing', title: 'Phishing' },
  //   { id: 'https', title: 'Navigazione Sicura (HTTPS)' },
  //   { id: 'password', title: 'Password' },
  //   { id: '2fa', title: 'Autenticazione a Due Fattori (2FA)' },
  //   { id: 'malware', title: 'Malware' },
  //   { id: 'antivirus', title: 'Antivirus e Firewall' },
  //   { id: 'social-engineering', title: 'Ingegneria Sociale' },
  //   { id: 'deep-web', title: 'Deep Web e Dark Web' },
  // ];

  return (
    <section
      className='section-container w-full flex flex-col gap-8 mb-12'
      style={{ marginTop: navbarHeight }}
    >
      <h1 className='section-title text-center self-center'>Manuale</h1>
      <div className='flex flex-col items-center gap-8 w-full h-full p-4'>
        {/* <div className='p-4 shadow-lg z-10'>
          <ul className='flex flex-col justify-center gap-4 mt-4'>
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className='text-blue-500 hover:underline'
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div> */}
        <div className='w-full max-w-4xl'>
          <Section id='introduction' title='Introduzione'>
            <p>
              Benvenuto nel manuale di sicurezza online! Questo documento è
              pensato per riassumere e approfondire i concetti che hai appreso
              attraverso l'app. La sicurezza online è fondamentale per
              proteggere le tue informazioni personali e mantenere un'esperienza
              sicura sul web. Esploriamo insieme i principali argomenti trattati
              nel gioco.
            </p>
          </Section>
          <Section id='phishing' title='Phishing'>
            <SubSection title="Cos'è il Phishing?">
              <p>
                Il phishing è una tecnica utilizzata dai criminali informatici
                per ingannarti e farti rivelare informazioni personali come
                password, numeri di carte di credito o altri dati sensibili.
                Questi attacchi avvengono spesso tramite email, messaggi di
                testo o siti web falsi che sembrano legittimi.
              </p>
            </SubSection>
            <SubSection title='Come riconoscerlo?'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Email sospette:</strong> Controlla l'indirizzo del
                  mittente; spesso è simile ma non identico a un'azienda
                  legittima.
                </li>
                <li>
                  <strong>Errori grammaticali:</strong> Le email di phishing
                  spesso contengono errori grammaticali o di ortografia.
                </li>
                <li>
                  <strong>Link e allegati:</strong> Non cliccare su link o
                  scaricare allegati da fonti sconosciute.
                </li>
                <li>
                  <strong>Richieste urgenti:</strong> Diffida di email che
                  richiedono azioni immediate, come aggiornare una password o
                  confermare informazioni personali.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Prevenzione'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Verifica l'indirizzo:</strong> Controlla l'indirizzo
                  email del mittente per assicurarti che sia legittimo.
                </li>
                <li>
                  <strong>Non cliccare:</strong> Non cliccare su link o
                  scaricare allegati da email sospette.
                </li>
                <li>
                  <strong>Contatta l'azienda:</strong> Se ricevi una richiesta
                  sospetta, contatta direttamente l'azienda per verificare
                  l'autenticità dell'email.
                </li>
                <li>
                  <strong>Usa software di sicurezza:</strong> Antivirus e filtri
                  anti-phishing possono aiutarti a identificare email e siti web
                  pericolosi.
                </li>
              </ul>
            </SubSection>
          </Section>
          <Section id='https' title='Navigazione Sicura (HTTPS)'>
            <SubSection title="Cos'è HTTPS?">
              <p>
                HTTPS è un protocollo di comunicazione che protegge i dati
                scambiati tra il tuo browser e il sito web che stai visitando.
                L'utilizzo di HTTPS garantisce che le informazioni trasmesse
                siano crittografate e protette da accessi non autorizzati.
              </p>
            </SubSection>
            <SubSection title='Perché è importante?'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Protezione dei dati:</strong> HTTPS protegge i tuoi
                  dati personali da accessi non autorizzati.
                </li>
                <li>
                  <strong>Autenticità del sito:</strong> La presenza di HTTPS
                  indica che il sito è autentico e sicuro.
                </li>
                <li>
                  <strong>Integrità delle informazioni:</strong> HTTPS
                  garantisce che le informazioni trasmesse non siano state
                  modificate durante il trasferimento.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Come riconoscere un sito sicuro?'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>URL:</strong> Verifica che l'URL inizi con "https://"
                  anziché "http://".
                </li>
                <li>
                  <strong>Lucchetto:</strong> Controlla la presenza di un
                  lucchetto nella barra degli indirizzi.
                </li>
                <li>
                  <strong>Certificato SSL:</strong> Clicca sul lucchetto per
                  visualizzare il certificato SSL del sito.
                </li>
              </ul>
            </SubSection>
          </Section>
          <Section id='password' title='Password'>
            <SubSection title='Come creare una password sicura?'>
              <p>
                Una password sicura è fondamentale per proteggere i tuoi account
                online. Ecco alcuni consigli per creare una password forte:
              </p>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Lunghezza:</strong> Usa almeno 8-12 caratteri per la
                  tua password.
                </li>
                <li>
                  <strong>Complessità:</strong> Usa una combinazione di lettere
                  maiuscole e minuscole, numeri e simboli.
                </li>
                <li>
                  <strong>Unicità:</strong> Usa password diverse per ogni
                  account online.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Gestione delle password'>
              <p>
                Gestire le tue password in modo sicuro è essenziale per
                proteggere i tuoi account online. Ecco alcuni suggerimenti per
                una corretta gestione delle password:
              </p>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Password Manager:</strong> Utilizza un gestore di
                  password per memorizzare e proteggere le tue password.
                </li>
                <li>
                  <strong>Cambia le password regolarmente:</strong> Aggiorna le
                  tue password periodicamente per proteggere i tuoi account.
                </li>
              </ul>
            </SubSection>
          </Section>
          <Section id='2fa' title='Autenticazione a Due Fattori (2FA)'>
            <SubSection title="Cos'è l'autenticazione a due fattori?">
              <p>
                L'autenticazione a due fattori è un metodo di sicurezza che
                richiede due forme di verifica per accedere a un account online.
                Oltre alla password, è necessario un secondo fattore come un
                codice inviato via SMS o generato da un'applicazione.
              </p>
            </SubSection>
            <SubSection title='Vantaggi della 2FA'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Sicurezza aggiuntiva:</strong> La 2FA protegge il tuo
                  account anche se la tua password viene compromessa.
                </li>
                <li>
                  <strong>Facilità d'uso:</strong> La 2FA è facile da
                  configurare e utilizzare per proteggere i tuoi account.
                </li>
                <li>
                  <strong>Protezione dai phishing:</strong> La 2FA previene gli
                  attacchi di phishing e l'accesso non autorizzato.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Come attivare la 2FA?'>
              <p>
                Per attivare l'autenticazione a due fattori, segui questi
                passaggi:
              </p>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Impostazioni account:</strong> Accedi alle
                  impostazioni del tuo account online.
                </li>
                <li>
                  <strong>Attiva la 2FA:</strong> Cerca l'opzione per attivare
                  la 2FA e segui le istruzioni.
                </li>
                <li>
                  <strong>Configura il secondo fattore:</strong> Scegli tra
                  codice SMS, app autenticatore o chiave di sicurezza.
                </li>
              </ul>
            </SubSection>
          </Section>
          <Section id='malware' title='Malware'>
            <SubSection title="Cos'è il malware?">
              <p>
                Il malware è un software dannoso progettato per danneggiare,
                controllare o rubare informazioni dal tuo dispositivo. Esistono
                diversi tipi di malware, come virus, worm, trojan, ransomware e
                spyware.
              </p>
            </SubSection>
            <SubSection title='Tipi di malware'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Virus:</strong> Si diffondono infettando file
                  eseguibili e danneggiando il sistema operativo.
                </li>
                <li>
                  <strong>Worm:</strong> Si replicano e diffondono autonomamente
                  attraverso reti e dispositivi.
                </li>
                <li>
                  <strong>Trojan:</strong> Si presentano come software legittimo
                  ma contengono funzionalità dannose.
                </li>
                <li>
                  <strong>Ransomware:</strong> Bloccano i tuoi file e richiedono
                  un riscatto per ripristinarli.
                </li>
                <li>
                  <strong>Spyware:</strong> Monitorano le tue attività online e
                  rubano informazioni personali.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Come proteggerti dal malware'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Software antivirus:</strong> Utilizza un software
                  antivirus per rilevare e rimuovere il malware.
                </li>
                <li>
                  <strong>Aggiornamenti software:</strong> Mantieni aggiornati
                  il sistema operativo e le applicazioni per proteggerti dalle
                  vulnerabilità.
                </li>
                <li>
                  <strong>Download sicuri:</strong> Scarica software solo da
                  fonti affidabili e verificate.
                </li>
                <li>
                  <strong>Backup regolari:</strong> Esegui regolarmente il
                  backup dei tuoi file per proteggerli da perdite.
                </li>
              </ul>
            </SubSection>
          </Section>
          <Section id='antivirus' title='Antivirus e Firewall'>
            <SubSection title="Cos'è un antivirus?">
              <p>
                Un antivirus è un software progettato per rilevare, prevenire e
                rimuovere virus e malware dal tuo dispositivo. Protegge il tuo
                sistema operativo e i tuoi dati da minacce informatiche dannose.
              </p>
            </SubSection>
            <SubSection title="Cos'è un firewall?">
              <p>
                Un firewall è un sistema di sicurezza che monitora e controlla
                il traffico di rete in entrata e in uscita dal tuo dispositivo.
                Blocca le connessioni non autorizzate e previene gli attacchi
                informatici.
              </p>
            </SubSection>
            <SubSection title='Importanza'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Protezione dai malware:</strong> Un antivirus protegge
                  il tuo dispositivo da virus e minacce online.
                </li>
                <li>
                  <strong>Sicurezza della rete:</strong> Un firewall previene
                  gli accessi non autorizzati alla tua rete.
                </li>
                <li>
                  <strong>Privacy e protezione:</strong> Antivirus e firewall
                  proteggono la tua privacy e i tuoi dati sensibili.
                </li>
              </ul>
            </SubSection>
          </Section>
          <Section id='social-engineering' title='Ingegneria Sociale'>
            <SubSection title="Cos'è l'ingegneria sociale?">
              <p>
                L'ingegneria sociale è una tecnica utilizzata per manipolare le
                persone e ottenere informazioni riservate o accesso non
                autorizzato a sistemi informatici. Gli attaccanti sfruttano la
                fiducia, la curiosità o la paura per ottenere ciò che vogliono.
              </p>
            </SubSection>
            <SubSection title='Tecniche comuni'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Phishing:</strong> Gli attaccanti inviano email o
                  messaggi falsi per ottenere informazioni personali.
                </li>
                <li>
                  <strong>Pretesti:</strong> Si presentano come persone fidate o
                  autorità per ottenere accesso ai sistemi.
                </li>
                <li>
                  <strong>Inganno telefonico:</strong> Chiamano le vittime
                  fingendo di essere tecnici o dipendenti di aziende.
                </li>
                <li>
                  <strong>Social engineering online:</strong> Utilizzano i
                  social media per raccogliere informazioni su di te.
                </li>
              </ul>
            </SubSection>
            <SubSection title='Come difendersi'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Consapevolezza:</strong> Sii consapevole delle
                  tecniche di ingegneria sociale e diffida delle richieste
                  sospette.
                </li>
                <li>
                  <strong>Verifica l'identità:</strong> Verifica l'identità
                  delle persone prima di condividere informazioni riservate.
                </li>
                <li>
                  <strong>Formazione:</strong> Formati sulla sicurezza
                  informatica e le tecniche di ingegneria sociale.
                </li>
                <li>
                  <strong>Segnalazione:</strong> Segnala tentativi di ingegneria
                  sociale alle autorità competenti.
                </li>
              </ul>
            </SubSection>
          </Section>
          <Section id='deep-web' title='Deep Web e Dark Web'>
            <SubSection title="Cos'è il Deep Web?">
              <p>
                Il Deep Web è la parte nascosta e non indicizzata del web, non
                accessibile tramite i motori di ricerca convenzionali. Contiene
                informazioni e risorse non disponibili al pubblico generale.
              </p>
            </SubSection>
            <SubSection title="Cos'è il Dark Web?">
              <p>
                Il Dark Web è una parte del Deep Web che ospita contenuti
                illegali, mercati neri, attività criminali e servizi anonimi. È
                accessibile solo tramite software specifici come Tor.
              </p>
            </SubSection>
            <SubSection title='Differenze'>
              <ul className='list-disc ml-5'>
                <li>
                  <strong>Accesso:</strong> Il Deep Web è accessibile a tutti,
                  mentre il Dark Web richiede software specifici.
                </li>
                <li>
                  <strong>Contenuti:</strong> Il Deep Web contiene informazioni
                  private, il Dark Web ospita attività illegali.
                </li>
                <li>
                  <strong>Anonimato:</strong> Il Deep Web garantisce la privacy,
                  il Dark Web offre l'anonimato completo.
                </li>
              </ul>
            </SubSection>
          </Section>
        </div>
      </div>
    </section>
  );
};

type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
};

const Section = ({ id, title, children }: SectionProps) => (
  <div id={id} className='my-8 w-full'>
    <h2 className='text-xl font-bold text-red-600 uppercase underline'>
      {title}
    </h2>
    {children}
    <hr className='border-t border-gray-300 my-4' />
  </div>
);

type SubSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SubSection = ({ title, children }: SubSectionProps) => (
  <div className='my-4'>
    <h3 className='text-lg font-semibold text-orange-500'>{title}</h3>
    {children}
  </div>
);

export default ManualScreen;
