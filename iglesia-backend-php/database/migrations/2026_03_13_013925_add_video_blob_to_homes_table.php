<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homes', function (Blueprint $table) {
            $table->string('heroVideoMime', 50)->nullable()->after('heroVideoUrl');
            $table->string('heroVideoName', 255)->nullable()->after('heroVideoMime');
        });

        DB::statement("ALTER TABLE homes ADD COLUMN heroVideoData LONGBLOB NULL AFTER heroVideoUrl");
    }

    public function down(): void
    {
        Schema::table('homes', function (Blueprint $table) {
            $table->dropColumn(['heroVideoData', 'heroVideoMime', 'heroVideoName']);
        });
    }
};
