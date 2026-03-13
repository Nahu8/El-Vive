<?php

namespace App\Http\Controllers;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');

        if (!$username || !$password) {
            return response()->json(['error' => 'Usuario y contraseña son requeridos'], 400);
        }

        $user = User::where('username', $username)->first();
        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        $secret = config('app.jwt_secret', 'elvive-iglesia-secret-2024');
        $payload = [
            'id' => $user->id,
            'username' => $user->username,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + (8 * 3600),
        ];
        $token = JWT::encode($payload, $secret, 'HS256');

        return response()->json([
            'token' => $token,
            'user' => ['id' => $user->id, 'username' => $user->username, 'role' => $user->role],
        ]);
    }

    public function createUser(Request $request)
    {
        $jwtUser = $request->attributes->get('jwt_user');
        if (!$jwtUser || $jwtUser['role'] !== 'superadmin') {
            return response()->json(['error' => 'Permisos insuficientes'], 403);
        }

        $username = $request->input('username');
        $password = $request->input('password');
        if (!$username || !$password) {
            return response()->json(['error' => 'Usuario y contraseña son requeridos'], 400);
        }

        if (User::where('username', $username)->exists()) {
            return response()->json(['error' => 'El usuario ya existe'], 400);
        }

        $user = User::create([
            'username' => $username,
            'password' => Hash::make($password),
            'role' => $request->input('role', 'admin'),
        ]);

        return response()->json(['id' => $user->id, 'username' => $user->username, 'role' => $user->role], 201);
    }
}
