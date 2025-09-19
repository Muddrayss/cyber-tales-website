import React, { useContext } from 'react';

import { NavbarContext } from '../contexts/navbar.context';

import HomeSection from '../components/home-section.component';

const Home: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  return (
    <section
      className='section-container w-full flex flex-col gap-8 mb-12'
      style={{ marginTop: navbarHeight }}
    >
      <h1 className='section-title text-center self-center'>CyberTales</h1>
      <HomeSection
        title='Benvenuto su CyberTales, il tuo difensore digitale!'
        paragraph="Intraprendi un viaggio illuminante nel mondo della sicurezza informatica con CyberTales. Progettata per rendere l'apprendimento della sicurezza digitale divertente e informativo, la nostra app offre un'avventura unica attraverso le vivaci strade di CyberCity. Pronto a diventare un campione della sicurezza informatica? Immergiti e scopri come proteggerti online ad ogni tocco!"
        src={`${
          import.meta.env.VITE_PUBLIC_URL
        }images/icons/cyber_tales_logo_with_text.png`}
        alt='cyber-tales-app-icon'
        imagePosition={'right'}
      />
      <HomeSection
        title='Perché la sicurezza informatica è importante?'
        paragraph='Nell’era digitale di oggi, la sicurezza informatica non è più un optional; è essenziale. Ogni giorno emergono nuove minacce che prendono di mira le nostre informazioni personali, la privacy e persino la nostra libertà digitale. Noi di CyberTales crediamo che la conoscenza sia potere. La nostra app interattiva non solo ti insegna come identificare queste minacce, ma ti fornisce anche le competenze per respingerle.'
        src={`${
          import.meta.env.VITE_PUBLIC_URL
        }images/cyber_security/cyber_security_img001.jpg`}
        alt='cyber-tales-app-icon'
        imagePosition={'left'}
      />
      <HomeSection
        title='Esplora le nostre funzionalità!'
        paragraph="CyberTales riunisce narrazione interattiva, scenari del mondo reale e quiz stimolanti per fornire un'esperienza di apprendimento completa. Naviga attraverso diverse sezioni come Email Alley e Malware Mountains, ciascuna progettata per affrontare aspetti chiave della sicurezza online."
        src={`${
          import.meta.env.VITE_PUBLIC_URL
        }images/cyber_security/cyber_security_img002.jpg`}
        alt='cyber-tales-app-icon'
        imagePosition={'right'}
      />
      <HomeSection
        title='Molto più di una semplice app!'
        paragraph="Oltre all’app, stiamo creando una community. Dai un'occhiata alla nostra sezione Musica per brani che risuonano con i temi della sicurezza digitale e non perdere la nostra pagina Instagram in cui suddividiamo argomenti complessi sulla sicurezza informatica in clip facili da digerire. Ogni piattaforma è un'estensione del nostro impegno volto a sensibilizzare ed educare sull'importanza della sicurezza informatica."
        src={`${
          import.meta.env.VITE_PUBLIC_URL
        }images/cyber_security/cyber_security_img003.jpg`}
        alt='cyber-tales-app-icon'
        imagePosition={'left'}
      />
      <HomeSection
        title='Unisciti a noi!'
        paragraph="Che tu sia uno studente, un professionista o semplicemente un cittadino digitale interessato a migliorare la tua sicurezza online, CyberTales è la tua via d'accesso per diventare un utente Internet più informato. Esplora la nostra app, segui i nostri social media e unisciti a una comunità in crescita di difensori digitali."
        src={`${
          import.meta.env.VITE_PUBLIC_URL
        }images/cyber_security/cyber_security_img004.jpg`}
        alt='cyber-tales-app-icon'
        imagePosition={'right'}
      />
    </section>
  );
};

export default Home;
