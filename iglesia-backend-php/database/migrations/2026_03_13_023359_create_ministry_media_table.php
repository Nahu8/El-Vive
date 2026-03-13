<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ministry_media', function (Blueprint $table) {
            $table->id();
            $table->string('ministryId', 100)->index();
            $table->enum('mediaType', ['icon', 'photo']);
            $table->string('imageMime', 50)->nullable();
            $table->string('imageName', 255)->nullable();
            $table->unsignedInteger('sortOrder')->default(0);
            $table->timestamps();
        });
        DB::statement("ALTER TABLE ministry_media ADD COLUMN imageData LONGBLOB NULL AFTER mediaType");
    }

    public function down(): void
    {
        Schema::dropIfExists('ministry_media');
    }
};
