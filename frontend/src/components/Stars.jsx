import React from 'react';

const Star = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.213 3.733a1 1 0 00.95.69h3.905c.969 0 1.371 1.24.588 1.81l-3.16 2.29a1 1 0 00-.364 1.118l1.213 3.733c.3.921-.755 1.688-1.538 1.118L10 13.347l-3.158 2.92c-.784.57-1.838-.197-1.539-1.118l1.214-3.733a1 1 0 00-.363-1.118L2 9.16c-.783-.57-.38-1.81.588-1.81h3.905a1 1 0 00.95-.69l1.213-3.733z" />
  </svg>
);

const Stars = ({ value = 0, onChange = ()=>{}, readOnly = false }) => {
  const stars = [1,2,3,4,5];
  return (
    <div className="flex items-center gap-1">
      {stars.map(s => (
        <div key={s} onClick={() => !readOnly && onChange(s)} style={{cursor: readOnly? 'default':'pointer'}}>
          <Star filled={s <= value} />
        </div>
      ))}
    </div>
  );
};

export default Stars;
