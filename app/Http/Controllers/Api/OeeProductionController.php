<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OeeProductionController extends Controller
{
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'productionData' => ['required', 'array'],
            'hourlyRecords' => ['required', 'array'],
            'currentHourIndex' => ['nullable', 'integer'],
        ]);

        $productionData = $validated['productionData'];
        $hourlyRecords = $validated['hourlyRecords'];

        return DB::transaction(function () use ($productionData, $hourlyRecords) {

            $productionId = DB::table('oee_productions')->updateOrInsert(
                [
                    'fecha' => $productionData['fecha'],
                    'turno' => $productionData['turno'],
                    'linea' => $productionData['linea'],
                    'op' => $productionData['op'] ?? null,
                ],
                [
                    'ingeniero' => $productionData['ingeniero'] ?? null,
                    'operador' => $productionData['operador'] ?? null,
                    'sku' => $productionData['sku'] ?? null,
                    'descripcion' => $productionData['descripccion'] ?? null,
                    'formato' => $productionData['formato'] ?? null,
                    'marca' => $productionData['marca'] ?? null,
                    'sabor' => $productionData['sabor'] ?? null,
                    'pallets_por_hora' => $productionData['palletsPorHora'] ?? 0,
                    'bph' => $productionData['bph'] ?? 0,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $production = DB::table('oee_productions')
                ->where('fecha', $productionData['fecha'])
                ->where('turno', $productionData['turno'])
                ->where('linea', $productionData['linea'])
                ->where('op', $productionData['op'] ?? null)
                ->first();

            foreach ($hourlyRecords as $hour) {
                DB::table('oee_hour_details')->updateOrInsert(
                    [
                        'oee_production_id' => $production->id,
                        'hour_index' => $hour['hourIndex'],
                    ],
                    [
                        'hour_range' => $hour['hour'],
                        'estimado' => $hour['estimado'] ?? 0,
                        'producido' => $hour['producido'] ?? 0,
                        'minutos_a_justificar' => $hour['justificar'] ?? 0,
                        'minutos_justificados' => $hour['justificado'] ?? 0,
                        'status' => $hour['status'] ?? 'blue',
                        'closed' => $hour['closed'] ?? false,
                        'comment_mnf' => $hour['comments']['mnf'] ?? null,
                        'comment_mantto' => $hour['comments']['mantto'] ?? null,
                        'comment_calidad' => $hour['comments']['calidad'] ?? null,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );

                $hourDetail = DB::table('oee_hour_details')
                    ->where('oee_production_id', $production->id)
                    ->where('hour_index', $hour['hourIndex'])
                    ->first();

                // Para demo: borramos y reinsertamos paradas de esa hora.
                // Es simple y evita duplicados raros.
                DB::table('oee_stop_details')
                    ->where('oee_hour_detail_id', $hourDetail->id)
                    ->delete();

                foreach ($hour['stops'] ?? [] as $stop) {
                    DB::table('oee_stop_details')->insert([
                        'oee_hour_detail_id' => $hourDetail->id,
                        'frontend_id' => $stop['id'] ?? null,
                        'codigo' => $stop['codigo'] ?? '',
                        'tipo' => $stop['tipo'] ?? '',
                        'descripcion' => $stop['descripcion'] ?? null,
                        'tiempo_minutos' => $stop['tiempoMinutos'] ?? 0,
                        'frecuencia' => $stop['frecuencia'] ?? 1,
                        'registered_at' => !empty($stop['timestamp'])
                        ? Carbon::parse($stop['timestamp'])->format('Y-m-d H:i:s')
                        : now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            return response()->json([
                'ok' => true,
                'message' => 'Producción OEE sincronizada correctamente',
                'production_id' => $production->id,
            ]);
        });
    }

    public function index()
    {
        $productions = DB::table('oee_productions')
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->get();

        return response()->json($productions);
    }

    public function show($id)
    {
        $production = DB::table('oee_productions')->where('id', $id)->first();

        if (!$production) {
            return response()->json([
                'message' => 'Producción no encontrada'
            ], 404);
        }

        $hours = DB::table('oee_hour_details')
            ->where('oee_production_id', $id)
            ->orderBy('hour_index')
            ->get();

        $hourIds = $hours->pluck('id');

        $stops = DB::table('oee_stop_details')
            ->whereIn('oee_hour_detail_id', $hourIds)
            ->get()
            ->groupBy('oee_hour_detail_id');

        $hours = $hours->map(function ($hour) use ($stops) {
            $hour->stops = $stops[$hour->id] ?? [];
            return $hour;
        });

        return response()->json([
            'production' => $production,
            'hours' => $hours,
        ]);
    }

    public function oeeByLine(Request $request)
    {
        $date = $request->query('date');

        $query = DB::table('oee_productions as p')
            ->join('oee_hour_details as h', 'h.oee_production_id', '=', 'p.id')
            ->leftJoin('oee_stop_details as s', 's.oee_hour_detail_id', '=', 'h.id')
            ->select(
                'p.linea',
                DB::raw('COUNT(DISTINCT h.id) as horas_cerradas'),
                DB::raw('SUM(CASE WHEN s.tipo = "TIEMPO NO PROGRAMADO" THEN s.tiempo_minutos ELSE 0 END) as minutos_tnp'),
                DB::raw('SUM(CASE WHEN s.tipo != "TIEMPO NO PROGRAMADO" THEN s.tiempo_minutos ELSE 0 END) as minutos_paradas')
            )
            ->where('h.closed', true)
            ->groupBy('p.linea');

        if ($date) {
            $query->where('p.fecha', $date);
        }

        $rows = $query->get()->map(function ($row) {
            $tiempoBruto = $row->horas_cerradas * 60;
            $tiempoEfectivo = max(0, $tiempoBruto - $row->minutos_tnp);
            $tiempoProductivo = max(0, $tiempoEfectivo - $row->minutos_paradas);

            $oee = $tiempoEfectivo > 0
                ? ($tiempoProductivo / $tiempoEfectivo) * 100
                : 0;

            return [
                'linea' => $row->linea,
                'horas_cerradas' => $row->horas_cerradas,
                'minutos_tnp' => round($row->minutos_tnp, 2),
                'minutos_paradas' => round($row->minutos_paradas, 2),
                'oee' => round($oee, 2),
            ];
        });

        return response()->json($rows);
    }
}