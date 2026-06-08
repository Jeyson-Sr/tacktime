<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class StopCodeController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

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

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                  ->orWhere('detalle', 'like', "%{$search}%")
                  ->orWhere('tipo_parada', 'like', "%{$search}%")
                  ->orWhere('categoria', 'like', "%{$search}%")
                  ->orWhere('causa', 'like', "%{$search}%")
                  ->orWhere('recurso_afectado', 'like', "%{$search}%")
                  ->orWhere('familia_oee', 'like', "%{$search}%");
            });
        }

        $data = $query
            ->orderBy('codigo')
            ->get()
            ->map(function ($item) {
                return [
                    'codigo' => $item->codigo,
                    'detalle' => $item->detalle,

                    // Para que no rompa tu frontend actual
                    'tipo_n0' => $item->tipo_parada,
                    'nivel_1' => $item->categoria,
                    'nivel_2' => $item->causa,

                    // Campos reales de BD
                    'tipo_parada' => $item->tipo_parada,
                    'categoria' => $item->categoria,
                    'causa' => $item->causa,
                    'recurso_afectado' => $item->recurso_afectado,
                    'familia_oee' => $item->familia_oee,
                    'aplica_tetra' => $item->aplica_tetra,
                    'estado' => $item->estado,
                ];
            });

        return response()->json($data);
    }
}