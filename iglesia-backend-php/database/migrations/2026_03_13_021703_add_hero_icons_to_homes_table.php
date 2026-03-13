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
            $table->string('heroIconDomMime', 50)->nullable()->after('heroVideo2Name');
            $table->string('heroIconDomName', 255)->nullable()->after('heroIconDomMime');
            $table->string('heroIconMierMime', 50)->nullable()->after('heroIconDomName');
            $table->string('heroIconMierName', 255)->nullable()->after('heroIconMierMime');
        });
        DB::statement("ALTER TABLE homes ADD COLUMN heroIconDomData LONGBLOB NULL AFTER heroVideo2Name");
        DB::statement("ALTER TABLE homes ADD COLUMN heroIconMierData LONGBLOB NULL AFTER heroIconDomName");
    }

    public function down(): void
    {
        Schema::table('homes', function (Blueprint $table) {
            $table->dropColumn([
                'heroIconDomData', 'heroIconDomMime', 'heroIconDomName',
                'heroIconMierData', 'heroIconMierMime', 'heroIconMierName',
            ]);
        });
    }
};
