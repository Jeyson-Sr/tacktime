import React, { useState } from 'react';

interface RevealListProps {
  items: string[];
  isHoverMode?: boolean; // true = hover, false = click
  className?: string;
}

const RevealList = ({ items, isHoverMode = true, className = "" }: RevealListProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Manejador de click: solo funciona si NO es modo hover
  const handleInteraction = () => {
    if (!isHoverMode) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div 
      onClick={handleInteraction}
      // Solo añadimos la clase 'group' si el modo hover está activo
      className={`flex flex-wrap gap-2 p-4 cursor-pointer ${isHoverMode ? 'group' : ''} ${className}`}
    >
      {items.map((item, index) => {
        const firstLetter = item.charAt(0);
        const restOfText = item.slice(1);

        return (
          <div key={index} className="flex items-center">
            {/* Letra Inicial: Muy gruesa (font-black) */}
            <span className={`
              text-4xl font-black transition-colors duration-900
              ${isHoverMode ? 'group-hover:text-green-600' : (isOpen ? 'text-green-600' : 'text-green-800')}
              text-green-800
            `}>
              {firstLetter}
            </span>

            {/* Resto del texto: Más delgado (font-light) y animado */}
            <span className={`
              overflow-hidden whitespace-nowrap text-2xl font-light transition-all duration-900 ease-in-out
              ${isHoverMode 
                ? 'max-w-0 opacity-0 group-hover:max-w-md group-hover:opacity-100' 
                : (isOpen ? 'max-w-md opacity-100' : 'max-w-0 opacity-0')
              }
            `}>
              {restOfText}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RevealList;