import React from "react";

const Title = ({ text1, text2 }) => {
  return (
    <div className="inline-flex gap-4 items-center mb-8">
      <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
        <span className="text-rose-600 italic">{text1}</span>
        <span className="text-rose-950 ml-3">{text2}</span>
      </h2>
    </div>
  );
};

export default Title;