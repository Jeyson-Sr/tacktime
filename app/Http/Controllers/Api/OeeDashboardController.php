<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OeeDashboardController extends Controller
{
    private function normalizeStopType(?string $type): string
    {
        $type = strtoupper(trim((string) $type));

        return match ($type) {
            'EQ', 'EQUIPO' => 'EQ',
            'OPD', 'OPERATIVAS', 'OPERATIVA' => 'OPD',
            'OR', 'ORGANIZACIONALES', 'ORGANIZACIONAL' => 'OR',
            'PD', 'PLANIFICADAS', 'PLANIFICADA' => 'PD',
            'RD', 'RUTINARIAS', 'RUTINARIA' => 'RD',
            'QD', 'PERDIDAS DE CALIDAD', 'PÉRDIDAS DE CALIDAD', 'CALIDAD' => 'QD',
            'TNP', 'TIEMPO NO PROGRAMADO' => 'TNP',
            default => $type,
        };
    }

    private function emptyKpis(): array
    {
        return [
            'oee' => 0,
            'em' => 0,
            'opd' => 0,
            'or' => 0,
            'pd' => 0,
            'rd' => 0,
            'eq' => 0,
        ];
    }

    /**
     * Calcula OEE / EM por tiempo.
     * Importante: usa horas existentes, no solo cerradas, para que el dashboard
     * no quede en 0 durante pruebas o turnos abiertos.
     */
    private function calculateFromHours($hours): array
    {
        $totalMinutes = $hours->count() * 60;

        if ($totalMinutes <= 0) {
            return $this->emptyKpis();
        }

        $hourIds = $hours->pluck('id')->filter()->values();

        if ($hourIds->isEmpty()) {
            return $this->emptyKpis();
        }

        $stops = DB::table('oee_stop_details as stops')
            ->leftJoin('cod_stops as cs', 'cs.codigo', '=', 'stops.codigo')
            ->whereIn('stops.oee_hour_detail_id', $hourIds)
            ->select(
                'stops.tiempo_minutos',
                'stops.tipo as stop_tipo',
                'cs.tipo_parada as catalog_tipo'
            )
            ->get();

        $minsEQ = 0;
        $minsOPD = 0;
        $minsOR = 0;
        $minsPD = 0;
        $minsQD = 0;
        $minsRD = 0;
        $minsTNP = 0;

        foreach ($stops as $stop) {
            $tipo = $this->normalizeStopType($stop->catalog_tipo ?: $stop->stop_tipo);
            $minutes = (float) $stop->tiempo_minutos;

            match ($tipo) {
                'EQ' => $minsEQ += $minutes,
                'OPD' => $minsOPD += $minutes,
                'OR' => $minsOR += $minutes,
                'PD' => $minsPD += $minutes,
                'QD' => $minsQD += $minutes,
                'RD' => $minsRD += $minutes,
                'TNP' => $minsTNP += $minutes,
                default => null,
            };
        }

        $tiempoEfectivo = $totalMinutes - $minsTNP;

        if ($tiempoEfectivo <= 0) {
            return $this->emptyKpis();
        }

        $totalPerdidas = $minsEQ + $minsOPD + $minsOR + $minsPD + $minsQD + $minsRD;
        $tiempoProductivo = max(0, $tiempoEfectivo - $totalPerdidas);

        $oee = ($tiempoProductivo / $tiempoEfectivo) * 100;
        $em = (($tiempoEfectivo - $minsEQ) / $tiempoEfectivo) * 100;

        return [
            'oee' => round($oee, 1),
            'em' => round($em, 1),
            'opd' => round(($minsOPD / $tiempoEfectivo) * 100, 1),
            'or' => round(($minsOR / $tiempoEfectivo) * 100, 1),
            'pd' => round(($minsPD / $tiempoEfectivo) * 100, 1),
            'rd' => round(($minsRD / $tiempoEfectivo) * 100, 1),
            'eq' => round(($minsEQ / $tiempoEfectivo) * 100, 1),
        ];
    }

    private function applyProductionFilters($query, Request $request)
    {
        if ($request->filled('year')) {
            $query->whereYear('prod.fecha', $request->year);
        }

        if ($request->filled('month')) {
            $query->whereMonth('prod.fecha', $request->month);
        }

        if ($request->filled('week')) {
            $query->whereRaw('WEEK(prod.fecha, 1) = ?', [$request->week]);
        }

        if ($request->filled('day')) {
            $query->whereDate('prod.fecha', $request->day);
        }

        if ($request->filled('linea')) {
            $query->where('prod.linea', $request->linea);
        }

        if ($request->filled('marca')) {
            $query->where('prod.marca', $request->marca);
        }

        return $query;
    }

    private function applyStopFilters($query, Request $request)
    {
        $this->applyProductionFilters($query, $request);

        if ($request->filled('componente')) {
            $query->where('cs.tipo_parada', $request->componente);
        }

        return $query;
    }

    /**
     * Query base de horas para dashboard.
     * No filtra por closed para no dejar los gráficos en blanco si el turno aún no cerró.
     * Si necesitas solo cerradas, llama /dashboard/oee/...?...&closed_only=1
     */
    private function hoursQuery(Request $request)
    {
        $query = DB::table('oee_hour_details as h')
            ->join('oee_productions as prod', 'prod.id', '=', 'h.oee_production_id')
            ->select('h.id', 'h.estimado', 'h.producido', 'h.closed', 'prod.fecha', 'prod.linea', 'prod.marca');

        if ($request->boolean('closed_only')) {
            $query->where('h.closed', 1);
        }

        return $query;
    }

    public function filterOptions()
    {
        $years = DB::table('oee_productions')
            ->selectRaw('YEAR(fecha) as value')
            ->whereNotNull('fecha')
            ->distinct()
            ->orderByDesc('value')
            ->pluck('value');

        $months = DB::table('oee_productions')
            ->selectRaw('MONTH(fecha) as value')
            ->whereNotNull('fecha')
            ->distinct()
            ->orderBy('value')
            ->pluck('value');

        $weeks = DB::table('oee_productions')
            ->selectRaw('WEEK(fecha, 1) as value')
            ->whereNotNull('fecha')
            ->distinct()
            ->orderBy('value')
            ->pluck('value');

        $days = DB::table('oee_productions')
            ->whereNotNull('fecha')
            ->select('fecha')
            ->distinct()
            ->orderByDesc('fecha')
            ->pluck('fecha');

        $marcas = DB::table('oee_productions')
            ->whereNotNull('marca')
            ->where('marca', '<>', '')
            ->distinct()
            ->orderBy('marca')
            ->pluck('marca');

        $lineas = DB::table('oee_productions')
            ->whereNotNull('linea')
            ->where('linea', '<>', '')
            ->distinct()
            ->orderBy('linea')
            ->pluck('linea');

        $componentes = DB::table('cod_stops')
            ->select(
                'tipo_parada as value',
                DB::raw('COALESCE(MAX(categoria), MAX(tipo_parada)) as label')
            )
            ->where('estado', 'ACTIVO')
            ->whereNotNull('tipo_parada')
            ->where('tipo_parada', '<>', '')
            ->groupBy('tipo_parada')
            ->orderBy('tipo_parada')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'years' => $years,
                'months' => $months,
                'weeks' => $weeks,
                'days' => $days,
                'marcas' => $marcas,
                'lineas' => $lineas,
                'componentes' => $componentes,
            ],
        ]);
    }

    public function globalOee(Request $request)
    {
        $query = $this->hoursQuery($request);
        $this->applyProductionFilters($query, $request);

        $hours = $query->get();
        $kpis = $this->calculateFromHours($hours);

        return response()->json([
            'oee' => $kpis['oee'],
            'em' => $kpis['em'],
        ]);
    }

    public function lineEfficiencies(Request $request)
    {
        $lineQuery = DB::table('oee_productions as prod')
            ->select('prod.linea')
            ->whereNotNull('prod.linea')
            ->where('prod.linea', '<>', '')
            ->distinct();

        $this->applyProductionFilters($lineQuery, $request);

        $lines = $lineQuery->orderBy('prod.linea')->get();

        $data = $lines->map(function ($line) use ($request) {
            $hoursQuery = $this->hoursQuery($request)
                ->where('prod.linea', $line->linea);

            $this->applyProductionFilters($hoursQuery, $request);

            $hours = $hoursQuery->get();
            $kpis = $this->calculateFromHours($hours);

            return [
                'linea' => $line->linea,
                'line' => $line->linea,
                'name' => $line->linea,
                'oee' => $kpis['oee'],
                'em' => $kpis['em'],
                'OEE' => $kpis['oee'],
                'EM' => $kpis['em'],
            ];
        });

        return response()->json($data->sortByDesc('oee')->values());
    }

    public function dailyOee(Request $request)
    {
        $dateQuery = DB::table('oee_productions as prod')
            ->select('prod.fecha')
            ->whereNotNull('prod.fecha')
            ->distinct();

        $this->applyProductionFilters($dateQuery, $request);

        $dates = $dateQuery->orderBy('prod.fecha')->get();

        $data = $dates->map(function ($item) use ($request) {
            $hoursQuery = $this->hoursQuery($request)
                ->whereDate('prod.fecha', $item->fecha);

            $this->applyProductionFilters($hoursQuery, $request);

            $hours = $hoursQuery->get();
            $kpis = $this->calculateFromHours($hours);

            return [
                'dia' => date('d', strtotime($item->fecha)),
                'day' => date('d', strtotime($item->fecha)),
                'fecha' => $item->fecha,
                'name' => date('d/m', strtotime($item->fecha)),
                'oee' => $kpis['oee'],
                'OEE' => $kpis['oee'],
            ];
        });

        return response()->json($data->values());
    }

    public function weeklyOee(Request $request)
    {
        $weekQuery = DB::table('oee_productions as prod')
            ->selectRaw('YEAR(prod.fecha) as year, WEEK(prod.fecha, 1) as semana')
            ->whereNotNull('prod.fecha')
            ->groupByRaw('YEAR(prod.fecha), WEEK(prod.fecha, 1)');

        $this->applyProductionFilters($weekQuery, $request);

        $weeks = $weekQuery
            ->orderByRaw('YEAR(prod.fecha), WEEK(prod.fecha, 1)')
            ->get();

        $data = $weeks->map(function ($week) use ($request) {
            $hoursQuery = $this->hoursQuery($request)
                ->whereYear('prod.fecha', $week->year)
                ->whereRaw('WEEK(prod.fecha, 1) = ?', [$week->semana]);

            $this->applyProductionFilters($hoursQuery, $request);

            $hours = $hoursQuery->get();
            $kpis = $this->calculateFromHours($hours);

            return [
                'semana' => (string) $week->semana,
                'week' => (string) $week->semana,
                'year' => (int) $week->year,
                'label' => 'S' . $week->semana . ' - ' . $week->year,
                'name' => 'S' . $week->semana,
                'oee' => $kpis['oee'],
                'OEE' => $kpis['oee'],
            ];
        });

        return response()->json($data->values());
    }

    public function lineSummary(Request $request)
    {
        $lineQuery = DB::table('oee_productions as prod')
            ->select('prod.linea')
            ->whereNotNull('prod.linea')
            ->where('prod.linea', '<>', '')
            ->distinct();

        $this->applyProductionFilters($lineQuery, $request);

        $lines = $lineQuery->orderBy('prod.linea')->get();

        $data = $lines->map(function ($line) use ($request) {
            $hoursQuery = $this->hoursQuery($request)
                ->where('prod.linea', $line->linea);

            $this->applyProductionFilters($hoursQuery, $request);

            $hours = $hoursQuery->get();

            $volumeQuery = DB::table('oee_hour_details as h')
                ->join('oee_productions as prod', 'prod.id', '=', 'h.oee_production_id')
                ->where('prod.linea', $line->linea);

            if ($request->boolean('closed_only')) {
                $volumeQuery->where('h.closed', 1);
            }

            $this->applyProductionFilters($volumeQuery, $request);

            $volume = $volumeQuery->sum('h.producido');

            $kpis = $this->calculateFromHours($hours);

            return [
                'linea' => $line->linea,
                'vol_cu' => round((float) $volume, 0),
                'ph' => round((float) $volume, 0),
                'oee' => $kpis['oee'],
                'em' => $kpis['em'],
                'opd' => $kpis['opd'],
                'or' => $kpis['or'],
                'pd' => $kpis['pd'],
                'rd' => $kpis['rd'],
                'eq' => $kpis['eq'],
                'unidad_negocio' => 'GENERAL',
            ];
        });

        return response()->json($data->sortByDesc('vol_cu')->values());
    }

    public function stopCodesRanking(Request $request)
    {
        $query = DB::table('oee_stop_details as stops')
            ->join('oee_hour_details as hours', 'stops.oee_hour_detail_id', '=', 'hours.id')
            ->join('oee_productions as prod', 'hours.oee_production_id', '=', 'prod.id')
            ->leftJoin('cod_stops as cs', 'cs.codigo', '=', 'stops.codigo')
            ->select(
                'stops.codigo',
                DB::raw('COALESCE(MAX(cs.detalle), MAX(stops.descripcion)) as descripcion'),
                DB::raw('COALESCE(MAX(cs.tipo_parada), MAX(stops.tipo)) as componente'),
                DB::raw('COALESCE(MAX(cs.categoria), MAX(stops.tipo)) as categoria'),
                DB::raw('SUM(stops.tiempo_minutos) as total_minutos'),
                DB::raw('SUM(stops.frecuencia) as total_frecuencia')
            );

        if ($request->boolean('closed_only')) {
            $query->where('hours.closed', 1);
        }

        $this->applyStopFilters($query, $request);

        $query->groupBy('stops.codigo');

        $sortBy = $request->get('sort_by', 'minutes');

        if ($sortBy === 'frequency') {
            $query->orderByDesc('total_frecuencia');
        } else {
            $query->orderByDesc('total_minutos');
        }

        $limit = max(1, min((int) $request->get('limit', 10), 50));
        $data = $query->limit($limit)->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function paretoStops(Request $request)
    {
        $query = DB::table('oee_stop_details as stops')
            ->join('oee_hour_details as hours', 'stops.oee_hour_detail_id', '=', 'hours.id')
            ->join('oee_productions as prod', 'hours.oee_production_id', '=', 'prod.id')
            ->leftJoin('cod_stops as cs', 'cs.codigo', '=', 'stops.codigo')
            ->select(
                'stops.codigo',
                DB::raw('COALESCE(MAX(cs.detalle), MAX(stops.descripcion)) as descripcion'),
                DB::raw('COALESCE(MAX(cs.tipo_parada), MAX(stops.tipo)) as componente'),
                DB::raw('COALESCE(MAX(cs.categoria), MAX(stops.tipo)) as categoria'),
                DB::raw('SUM(stops.tiempo_minutos) as total_minutos'),
                DB::raw('SUM(stops.frecuencia) as total_frecuencia')
            );

        if ($request->boolean('closed_only')) {
            $query->where('hours.closed', 1);
        }

        $this->applyStopFilters($query, $request);

        $rows = $query
            ->groupBy('stops.codigo')
            ->orderByDesc('total_minutos')
            ->limit(max(1, min((int) $request->get('limit', 15), 50)))
            ->get();

        $total = $rows->sum('total_minutos');
        $acumulado = 0;

        $data = $rows->map(function ($row) use ($total, &$acumulado) {
            $porcentaje = $total > 0
                ? ((float) $row->total_minutos / $total) * 100
                : 0;

            $acumulado += $porcentaje;

            return [
                'codigo' => $row->codigo,
                'descripcion' => $row->descripcion,
                'componente' => $row->componente,
                'categoria' => $row->categoria,
                'total_minutos' => round((float) $row->total_minutos, 2),
                'total_frecuencia' => (int) $row->total_frecuencia,
                'porcentaje' => round($porcentaje, 2),
                'porcentaje_acumulado' => round($acumulado, 2),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data->values(),
        ]);
    }
}
