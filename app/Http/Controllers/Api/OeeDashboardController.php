<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class OeeDashboardController extends Controller
{
    private function calculateFromHours($hours)
    {
        $totalMinutes = $hours->count() * 60;

        if ($totalMinutes <= 0) {
            return $this->emptyKpis();
        }

        $hourIds = $hours->pluck('id');

        $stops = DB::table('oee_stop_details')
            ->whereIn('oee_hour_detail_id', $hourIds)
            ->get();

        $minsEQ = 0;
        $minsOPD = 0;
        $minsOR = 0;
        $minsPD = 0;
        $minsQD = 0;
        $minsRD = 0;
        $minsTNP = 0;

        foreach ($stops as $stop) {
            $tipo = strtoupper(trim($stop->tipo ?? ''));
            $minutes = (float) $stop->tiempo_minutos;

            if ($tipo === 'EQUIPO') {
                $minsEQ += $minutes;
            }

            if ($tipo === 'OPERATIVAS') {
                $minsOPD += $minutes;
            }

            if ($tipo === 'ORGANIZACIONALES') {
                $minsOR += $minutes;
            }

            if ($tipo === 'PLANIFICADAS') {
                $minsPD += $minutes;
            }

            if ($tipo === 'PERDIDAS DE CALIDAD') {
                $minsQD += $minutes;
            }

            if ($tipo === 'RUTINARIAS') {
                $minsRD += $minutes;
            }

            if ($tipo === 'TIEMPO NO PROGRAMADO') {
                $minsTNP += $minutes;
            }
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

    private function emptyKpis()
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

    public function lineEfficiencies()
    {
        $lines = DB::table('oee_productions')
            ->select('linea')
            ->whereNotNull('linea')
            ->distinct()
            ->get();

        $data = $lines->map(function ($line) {
            $hours = DB::table('oee_hour_details as h')
                ->join('oee_productions as p', 'p.id', '=', 'h.oee_production_id')
                ->where('p.linea', $line->linea)
                ->where('h.closed', 1)
                ->select('h.id')
                ->get();

            $kpis = $this->calculateFromHours($hours);

            return [
                'linea' => $line->linea,
                'oee' => $kpis['oee'],
                'em' => $kpis['em'],
            ];
        });

        return response()->json(
            $data->sortByDesc('oee')->values()
        );
    }

    public function dailyOee()
    {
        $dates = DB::table('oee_productions')
            ->select('fecha')
            ->whereNotNull('fecha')
            ->distinct()
            ->orderBy('fecha')
            ->get();

        $data = $dates->map(function ($item) {
            $hours = DB::table('oee_hour_details as h')
                ->join('oee_productions as p', 'p.id', '=', 'h.oee_production_id')
                ->where('p.fecha', $item->fecha)
                ->where('h.closed', 1)
                ->select('h.id')
                ->get();

            $kpis = $this->calculateFromHours($hours);

            return [
                'dia' => date('d', strtotime($item->fecha)),
                'fecha' => $item->fecha,
                'oee' => $kpis['oee'],
            ];
        });

        return response()->json($data);
    }

    public function lineSummary()
    {
        $lines = DB::table('oee_productions')
            ->select('linea')
            ->whereNotNull('linea')
            ->distinct()
            ->get();

        $data = $lines->map(function ($line) {
            $hours = DB::table('oee_hour_details as h')
                ->join('oee_productions as p', 'p.id', '=', 'h.oee_production_id')
                ->where('p.linea', $line->linea)
                ->where('h.closed', 1)
                ->select('h.id')
                ->get();

            $volume = DB::table('oee_hour_details as h')
                ->join('oee_productions as p', 'p.id', '=', 'h.oee_production_id')
                ->where('p.linea', $line->linea)
                ->sum('h.producido');

            $kpis = $this->calculateFromHours($hours);

            return [
                'linea' => $line->linea,
                'vol_cu' => round($volume, 0),
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

        return response()->json(
            $data->sortByDesc('vol_cu')->values()
        );
    }

    public function weeklyOee()
    {
        $weeks = DB::table('oee_productions')
            ->selectRaw('WEEK(fecha, 1) as semana')
            ->whereNotNull('fecha')
            ->groupBy('semana')
            ->orderBy('semana')
            ->get();

        $data = $weeks->map(function ($week) {
            $hours = DB::table('oee_hour_details as h')
                ->join('oee_productions as p', 'p.id', '=', 'h.oee_production_id')
                ->whereRaw('WEEK(p.fecha, 1) = ?', [$week->semana])
                ->where('h.closed', 1)
                ->select('h.id')
                ->get();

            $kpis = $this->calculateFromHours($hours);

            return [
                'semana' => (string) $week->semana,
                'oee' => $kpis['oee'],
            ];
        });

        return response()->json($data);
    }

    public function globalOee()
    {
        $hours = DB::table('oee_hour_details')
            ->where('closed', 1)
            ->select('id')
            ->get();

        $kpis = $this->calculateFromHours($hours);

        return response()->json([
            'oee' => $kpis['oee'],
            'em' => $kpis['em'],
        ]);
    }
}