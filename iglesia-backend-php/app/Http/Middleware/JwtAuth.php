<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;

class JwtAuth
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $token = substr($header, 7);
        try {
            $secret = config('app.jwt_secret', 'elvive-iglesia-secret-2024');
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            $request->attributes->set('jwt_user', (array)$decoded);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }

        return $next($request);
    }
}
