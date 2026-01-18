import React from "react";

const Title = ({ text1, text2 }) => {
  return (
    <div className="inline-flex gap-3 items-center mb-6">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight drop-shadow-sm">
        <span className="text-pink-600">{text1} </span>
        <span className="text-white text-shadow-sm">{text2}</span>
      </h2>
    </div>
  );
};

export default Title;