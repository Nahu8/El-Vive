<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meeting_days', function (Blueprint $table) {
            $table->string('heroImageMime', 50)->nullable()->after('hero');
            $table->string('heroImageName', 255)->nullable()->after('heroImageMime');
        });

        DB::statement("ALTER TABLE meeting_days ADD COLUMN heroImageData LONGBLOB NULL AFTER hero");
    }

    public function down(): void
    {
        Schema::table('meeting_days', function (Blueprint $table) {
            $table->dropColumn(['heroImageData', 'heroImageMime', 'heroImageName']);
        });
    }
};
