import { useEffect, useState } from "react";
import { getOeeProductions } from "../server/oeeProduction.api";

export default function OeeProductionsTable() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    getOeeProductions().then(setRows);
  }, []);

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-green-50 p-6 text-gray-800"
      style={{ colorScheme: 'light' }}
    >
      <h2 className="text-2xl font-bold mb-6 text-green-800 border-b-2 border-green-400 pb-2 inline-block">
        Producciones Registradas
      </h2>

      {/* Contenedor responsivo para la tabla con bordes redondeados */}
      <div className="overflow-x-auto rounded-xl border border-green-200 shadow-sm">
        <table className="w-full text-sm text-left whitespace-nowrap">
          {/* Cabecera de la tabla en tono verde */}
          <thead className="bg-green-100 text-green-800 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="py-4 px-4">Fecha</th>
              <th className="py-4 px-4">Turno</th>
              <th className="py-4 px-4">Línea</th>
              <th className="py-4 px-4">SKU</th>
              <th className="py-4 px-4">Producto</th>
              <th className="py-4 px-4">OP</th>
            </tr>
          </thead>

          {/* Cuerpo de la tabla con efecto cebra y separadores verdes */}
          <tbody className="divide-y divide-green-100 text-gray-700">
            {rows.map((row, index) => (
              <tr 
                key={row.id} 
                className={`hover:bg-green-50 transition-colors duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-green-50/30"
                }`}
              >
                <td className="py-3 px-4 font-medium text-green-900">{row.fecha}</td>
                <td className="py-3 px-4">{row.turno}</td>
                <td className="py-3 px-4">
                  {/* Etiqueta redondeada para resaltar la línea */}
                  <span className="bg-green-100 text-green-700 py-1 px-2 rounded-full text-xs font-bold">
                    {row.linea}
                  </span>
                </td>
                <td className="py-3 px-4">{row.sku}</td>
                <td className="py-3 px-4">{row.descripcion}</td>
                <td className="py-3 px-4">{row.op}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mensaje por si la tabla está vacía o cargando */}
        {rows.length === 0 && (
          <div className="text-center py-8 text-green-600 font-medium">
            Cargando datos...
          </div>
        )}
      </div>
    </div>
  );
}