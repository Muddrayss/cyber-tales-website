import React from 'react';

import { MusicDataType } from '../types/music.type';

const MusicListItem: React.FC<MusicDataType> = (props) => {
  const { title, language, genre, youTubeLink } = props;

  return (
    <div className='flex flex-col items-center justify-center text-center p-6 w-full'>
      <h2 className='section-subtitle m-0 self-center text-center font-semibold text-on-primary bg-secondary w-full rounded-t-xl p-3 md:p-6'>
        {title} - {language} {genre}
      </h2>
      <div className='aspect-w-16 aspect-h-9 w-full'>
        <iframe
		className='w-full h-full rounded-b-xl'
          src={youTubeLink}
          title='YouTube video player'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default MusicListItem;
