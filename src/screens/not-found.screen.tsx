import React from 'react';

const NotFound: React.FC = () => {
  return (
    <main>
      <div className='max-w-screen-xl mx-auto px-4 flex items-center justify-start h-screen md:px-8'>
        <div className='max-w-lg mx-auto text-center'>
          <div className='pb-6'>
            <img
              src={`${
                import.meta.env.VITE_PUBLIC_URL
              }images/icons/cyber_tales_icon.png`}
              width={100}
              className='mx-auto'
            />
          </div>
          <h3 className='text-gray-800 text-4xl font-semibold sm:text-5xl'>
            Pagina non trovata
          </h3>
          <p className='text-gray-600 mt-3'>
            Ci dispiace, la pagina che stai cercando non è stata trovata o è
            stata rimossa.
          </p>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
