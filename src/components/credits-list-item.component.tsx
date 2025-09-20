import React from 'react';
import { CreditsDataType } from '../types/credits.type';

const CreditsListItem: React.FC<CreditsDataType> = (props) => {
  return (
    <div className='rounded-2xl bg-white/5 p-6 ring-1 ring-white/10'>
      <h2 className='text-xl md:text-2xl font-bold text-highlight'>
        {props.project}
      </h2>

      <ul className='mt-4 space-y-5'>
        {props.roles.map((role, index) => (
          <li key={index}>
            <h3 className='text-sm md:text-base font-semibold'>{role.role}</h3>
            <ul className='mt-2 space-y-1 text-sm md:text-base text-white/80'>
              {role.name.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreditsListItem;
