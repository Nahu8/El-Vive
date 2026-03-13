<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = ['username', 'password', 'role'];
    protected $hidden = ['password'];
    protected $casts = ['role' => 'string'];
}
