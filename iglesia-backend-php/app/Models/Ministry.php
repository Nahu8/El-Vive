<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ministry extends Model
{
    protected $table = 'ministry_items';
    protected $fillable = ['name', 'description', 'contact'];
}
