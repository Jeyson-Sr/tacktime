<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    public function share(Request $request): array
{
    return [
        'auth' => [
            'user' => $request->user(),
        ],
    ];
}
}
