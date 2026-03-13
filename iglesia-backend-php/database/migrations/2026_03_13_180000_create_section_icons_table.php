<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('section_icons', function (Blueprint $table) {
            $table->id();
            $table->string('page_key', 50)->index();
            $table->string('section_key', 50)->index();
            $table->string('imageMime', 50)->nullable();
            $table->string('imageName', 255)->nullable();
            $table->timestamps();
            $table->unique(['page_key', 'section_key']);
        });

        $driver = Schema::getConnection()->getDriverName();
        $table = Schema::getConnection()->getTablePrefix() . 'section_icons';
        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE {$table} ADD COLUMN imageData LONGBLOB NULL AFTER section_key");
        } else {
            DB::statement("ALTER TABLE {$table} ADD COLUMN imageData BLOB NULL");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('section_icons');
    }
};
