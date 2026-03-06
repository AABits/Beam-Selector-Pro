import React from 'react';

export const getBeamIcon = (name: string) => {
  const n = name.toUpperCase();
  if (n.includes('CUADRADO')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  if (n.includes('RECTANGULAR')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <rect x="2" y="4" width="12" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  if (n.includes('REDONDO')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  if (n.includes('IPE') || n.includes('IPN') || n.includes('HEA') || n.includes('HEB') || n.includes('W') || (n.includes('I') && !n.includes('MECANICO'))) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <path d="M3 2H13V4H9V12H13V14H3V12H7V4H3V2Z" fill="currentColor"/>
      </svg>
    );
  }
  if (n.includes('U') || n.includes('C') || n.includes('UPN')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <path d="M12 2H4V14H12V12H7V4H12V2Z" fill="currentColor"/>
      </svg>
    );
  }
  if (n.includes('L')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <path d="M4 2H7V11H14V14H4V2Z" fill="currentColor"/>
      </svg>
    );
  }
  if (n.includes('T')) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
        <path d="M2 2H14V5H9.5V14H6.5V5H2V2Z" fill="currentColor"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
      <path d="M2 2H14V14H2V2ZM5 5V11H11V5H5Z" fill="currentColor"/>
    </svg>
  );
};
