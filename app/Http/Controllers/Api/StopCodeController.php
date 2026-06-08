<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class StopCodeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = DB::table('cod_stops')
            ->select(
                'codigo',
                'detalle',
                'tipo_parada',
                'categoria',
                'causa',
                'recurso_afectado',
                'familia_oee',
                'aplica_tetra',
                'estado'
            )
            ->where('estado', 'ACTIVO');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                  ->orWhere('descripcion', 'like', "%{$search}%")
                  ->orWhere('categoria', 'like', "%{$search}%")
                  ->orWhere('causa', 'like', "%{$search}%")
                  ->orWhere('recurso_afectado', 'like', "%{$search}%");
            });
        }

        $data = $query
            ->orderBy('codigo')
            ->get()
            ->map(function ($item) {
                return [
                    'codigo' => $item->codigo,
                    'detalle' => $item->detalle,

                    // Esto alimenta tu TIPO_MAP actual
                    'tipo_n0' => $item->tipo_parada,

                    // Esto alimenta tu modal actual
                    'nivel_1' => $item->categoria,
                    'nivel_2' => $item->causa,

                    // Extras por si luego quieres mostrarlos
                    'recurso_afectado' => $item->recurso_afectado,
                    'familia_oee' => $item->familia_oee,
                    'aplica_tetra' => $item->aplica_tetra,
                    'estado' => $item->estado,
                ];
            });

        return response()->json($data);
    }
}