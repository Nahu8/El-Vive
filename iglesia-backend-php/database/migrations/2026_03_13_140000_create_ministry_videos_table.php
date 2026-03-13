<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ministry_videos', function (Blueprint $table) {
            $table->id();
            $table->string('ministryId', 100)->index();
            $table->string('videoMime', 50)->nullable();
            $table->string('videoName', 255)->nullable();
            $table->unsignedInteger('sortOrder')->default(0);
            $table->timestamps();
        });

        $driver = Schema::getConnection()->getDriverName();
        $table = Schema::getConnection()->getTablePrefix() . 'ministry_videos';
        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE {$table} ADD COLUMN videoData LONGBLOB NULL AFTER ministryId");
        } else {
            DB::statement("ALTER TABLE {$table} ADD COLUMN videoData BLOB NULL");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ministry_videos');
    }
};
