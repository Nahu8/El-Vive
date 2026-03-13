<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'superadmin'])->default('admin');
            $table->timestamps();
        });

        Schema::create('homes', function (Blueprint $table) {
            $table->id();
            $table->string('heroTitle')->nullable();
            $table->string('heroButton1Text')->nullable();
            $table->string('heroButton1Link')->nullable();
            $table->string('heroButton2Text')->nullable();
            $table->string('heroButton2Link')->nullable();
            $table->text('heroVideoUrl')->nullable();
            $table->string('video1Url')->nullable();
            $table->string('video2Url')->nullable();
            $table->unsignedBigInteger('currentTheme')->nullable();
            $table->json('celebrations')->nullable();
            $table->json('meetingDaysSummary')->nullable();
            $table->json('ministriesSummary')->nullable();
            $table->timestamps();
        });

        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('videoUrl1')->nullable();
            $table->string('videoUrl2')->nullable();
            $table->string('iconUrl1')->nullable();
            $table->string('iconUrl2')->nullable();
            $table->json('palette1')->nullable();
            $table->json('palette2')->nullable();
            $table->timestamps();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->json('socialMedia')->nullable();
            $table->json('schedules')->nullable();
            $table->json('departments')->nullable();
            $table->text('mapEmbed')->nullable();
            $table->text('additionalInfo')->nullable();
            $table->timestamps();
        });

        Schema::create('layouts', function (Blueprint $table) {
            $table->id();
            $table->json('navLinks')->nullable();
            $table->string('footerBrandTitle')->nullable();
            $table->text('footerBrandDescription')->nullable();
            $table->string('footerFacebookUrl')->nullable();
            $table->string('footerInstagramUrl')->nullable();
            $table->string('footerYoutubeUrl')->nullable();
            $table->string('footerAddress')->nullable();
            $table->string('footerEmail')->nullable();
            $table->string('footerPhone')->nullable();
            $table->string('footerCopyright')->nullable();
            $table->string('footerPrivacyUrl')->nullable();
            $table->string('footerTermsUrl')->nullable();
            $table->json('quickLinks')->nullable();
            $table->timestamps();
        });

        Schema::create('meeting_days', function (Blueprint $table) {
            $table->id();
            $table->json('calendarEvents')->nullable();
            $table->json('recurringMeetings')->nullable();
            $table->json('hero')->nullable();
            $table->json('upcomingEvents')->nullable();
            $table->json('eventCta')->nullable();
            $table->json('eventSettings')->nullable();
            $table->timestamps();
        });

        Schema::create('ministries_content', function (Blueprint $table) {
            $table->id();
            $table->json('hero')->nullable();
            $table->json('ministries')->nullable();
            $table->json('statistics')->nullable();
            $table->json('process')->nullable();
            $table->json('testimonials')->nullable();
            $table->json('faqs')->nullable();
            $table->json('pageContent')->nullable();
            $table->timestamps();
        });

        Schema::create('ministry_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('contact');
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('date');
            $table->string('time');
            $table->string('location');
            $table->string('category');
            $table->text('description');
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject');
            $table->text('message');
            $table->string('ministry')->nullable();
            $table->timestamps();
        });

        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('originalName');
            $table->string('path');
            $table->enum('type', ['image', 'video', 'icon']);
            $table->unsignedInteger('size');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('events');
        Schema::dropIfExists('ministry_items');
        Schema::dropIfExists('ministries_content');
        Schema::dropIfExists('meeting_days');
        Schema::dropIfExists('layouts');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('themes');
        Schema::dropIfExists('homes');
        Schema::dropIfExists('users');
    }
};
