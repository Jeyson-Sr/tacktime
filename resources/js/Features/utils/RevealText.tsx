
const RevealText = ({ text, className = "" }: { text: string, className?: string }) => {
  if (!text) return null;

  // Separamos la primera letra del resto
  const firstLetter = text.charAt(0);
  const restOfText = text.slice(1);

  return (
    <div className={`inline-block group cursor-pointer ${className}`}>
      <span className="flex items-center overflow-hidden">
        {/* La primera letra siempre visible */}
        <span className="font-bold text-gray-800">
          {firstLetter}
        </span>

        {/* El resto del texto: oculto por defecto, se expande al hacer hover */}
        <span className="max-w-0 opacity-0 transition-all duration-900 ease-in-out group-hover:max-w-xs group-hover:opacity-100 whitespace-nowrap">
          {restOfText}
        </span>
      </span>
    </div>
  );
};

export default RevealText;