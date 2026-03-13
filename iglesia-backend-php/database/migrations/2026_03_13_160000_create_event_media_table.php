<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_media', function (Blueprint $table) {
            $table->id();
            $table->string('eventId', 100)->index();
            $table->string('mediaType', 20)->default('icon'); // 'icon' | 'background'
            $table->string('imageMime', 50)->nullable();
            $table->string('imageName', 255)->nullable();
            $table->timestamps();
        });

        $driver = Schema::getConnection()->getDriverName();
        $table = Schema::getConnection()->getTablePrefix() . 'event_media';
        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE {$table} ADD COLUMN imageData LONGBLOB NULL AFTER mediaType");
        } else {
            DB::statement("ALTER TABLE {$table} ADD COLUMN imageData BLOB NULL");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('event_media');
    }
};
