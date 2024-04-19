import React from 'react';

import { CreditsDataType } from '../types/credits.type';

const CreditsListItem: React.FC<CreditsDataType> = (props) => {
  return (
    <div className='flex flex-col gap-6 items-center justify-center text-center bg-primary bg-opacity-50 rounded-md p-6 w-full'>
      <h2 className='text-4xl font-bold text-highlight'>{props.project}</h2>
      <ul className='list-none'>
        {props.roles.map((role, index) => (
          <li key={index} className='mt-6'>
            <h3 className='text-2xl font-semibold'>{role.role}</h3>
            <ul className='text-xl text-gray-300 mt-3'>
              {role.name.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreditsListItem;
