<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Second hero video (Miercoles: Mon-Wed)
        Schema::table('homes', function (Blueprint $table) {
            $table->string('heroVideo2Mime', 50)->nullable()->after('heroVideoName');
            $table->string('heroVideo2Name', 255)->nullable()->after('heroVideo2Mime');
        });
        DB::statement("ALTER TABLE homes ADD COLUMN heroVideo2Data LONGBLOB NULL AFTER heroVideoName");

        // Meeting card images table
        Schema::create('meeting_card_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('cardIndex');
            $table->string('imageMime', 50)->nullable();
            $table->string('imageName', 255)->nullable();
            $table->timestamps();
            $table->unique('cardIndex');
        });
        DB::statement("ALTER TABLE meeting_card_images ADD COLUMN imageData LONGBLOB NULL AFTER cardIndex");
    }

    public function down(): void
    {
        Schema::table('homes', function (Blueprint $table) {
            $table->dropColumn(['heroVideo2Data', 'heroVideo2Mime', 'heroVideo2Name']);
        });
        Schema::dropIfExists('meeting_card_images');
    }
};
