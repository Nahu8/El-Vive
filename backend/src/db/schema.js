/**
 * Esquema SQLite compatible con la API del backend PHP (Laravel).
 * Los blobs se reemplazan por rutas a archivos en uploads/
 */

export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin' CHECK(role IN ('admin','superadmin')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS homes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      heroTitle TEXT,
      heroButton1Text TEXT,
      heroButton1Link TEXT,
      heroButton2Text TEXT,
      heroButton2Link TEXT,
      heroVideoUrl TEXT,
      heroVideoPath TEXT,
      heroVideoMime TEXT,
      heroVideoName TEXT,
      heroVideo2Path TEXT,
      heroVideo2Mime TEXT,
      heroVideo2Name TEXT,
      heroIconDomPath TEXT,
      heroIconDomMime TEXT,
      heroIconDomName TEXT,
      heroIconMierPath TEXT,
      heroIconMierMime TEXT,
      heroIconMierName TEXT,
      currentTheme INTEGER,
      celebrations TEXT,
      meetingDaysSummary TEXT,
      ministriesSummary TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meeting_card_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardIndex INTEGER UNIQUE NOT NULL,
      imagePath TEXT,
      imageMime TEXT,
      imageName TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      socialMedia TEXT,
      schedules TEXT,
      departments TEXT,
      mapEmbed TEXT,
      additionalInfo TEXT,
      pageContent TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS layouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      navLinks TEXT,
      footerBrandTitle TEXT,
      footerBrandDescription TEXT,
      footerFacebookUrl TEXT,
      footerInstagramUrl TEXT,
      footerYoutubeUrl TEXT,
      footerAddress TEXT,
      footerEmail TEXT,
      footerPhone TEXT,
      footerCopyright TEXT,
      footerPrivacyUrl TEXT,
      footerTermsUrl TEXT,
      quickLinks TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meeting_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      calendarEvents TEXT,
      recurringMeetings TEXT,
      hero TEXT,
      upcomingEvents TEXT,
      eventCta TEXT,
      eventSettings TEXT,
      heroImagePath TEXT,
      heroImageMime TEXT,
      heroImageName TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ministries_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hero TEXT,
      ministries TEXT,
      statistics TEXT,
      process TEXT,
      testimonials TEXT,
      faqs TEXT,
      pageContent TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT,
      time TEXT,
      location TEXT,
      category TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      ministry TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS section_icons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_key TEXT NOT NULL,
      section_key TEXT NOT NULL,
      imagePath TEXT,
      imageMime TEXT,
      imageName TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(page_key, section_key)
    );

    CREATE TABLE IF NOT EXISTS event_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId TEXT NOT NULL,
      mediaType TEXT DEFAULT 'icon',
      imagePath TEXT,
      imageMime TEXT,
      imageName TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ministry_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ministryId TEXT NOT NULL,
      mediaType TEXT NOT NULL,
      imagePath TEXT,
      imageMime TEXT,
      imageName TEXT,
      sortOrder INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ministry_card_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ministryId TEXT NOT NULL,
      imagePath TEXT,
      imageMime TEXT,
      imageName TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ministry_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ministryId TEXT NOT NULL,
      videoPath TEXT,
      videoMime TEXT,
      videoName TEXT,
      sortOrder INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      path TEXT NOT NULL,
      type TEXT DEFAULT 'image',
      size INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS generic_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_key TEXT UNIQUE NOT NULL,
      page_content TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ministry_pdfs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ministryId TEXT NOT NULL UNIQUE,
      filePath TEXT,
      fileMime TEXT,
      fileName TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: add whatsappNumber to layouts if not exists
  try {
    const cols = db.prepare('PRAGMA table_info(layouts)').all();
    if (!cols.some(c => c.name === 'whatsappNumber')) {
      db.prepare('ALTER TABLE layouts ADD COLUMN whatsappNumber TEXT').run();
    }
  } catch (_) {}

  // Migration: add 2x2 hero media columns (day x mode) if not exists
  try {
    const cols = db.prepare('PRAGMA table_info(homes)').all();
    const maybeAdd = (name, type = 'TEXT') => {
      if (!cols.some(c => c.name === name)) {
        db.prepare(`ALTER TABLE homes ADD COLUMN ${name} ${type}`).run();
      }
    };
    // Videos
    maybeAdd('heroVideoDomLightPath');
    maybeAdd('heroVideoDomLightMime');
    maybeAdd('heroVideoDomLightName');
    maybeAdd('heroVideoDomDarkPath');
    maybeAdd('heroVideoDomDarkMime');
    maybeAdd('heroVideoDomDarkName');
    maybeAdd('heroVideoMierLightPath');
    maybeAdd('heroVideoMierLightMime');
    maybeAdd('heroVideoMierLightName');
    maybeAdd('heroVideoMierDarkPath');
    maybeAdd('heroVideoMierDarkMime');
    maybeAdd('heroVideoMierDarkName');
    // Icons
    maybeAdd('heroIconDomLightPath');
    maybeAdd('heroIconDomLightMime');
    maybeAdd('heroIconDomLightName');
    maybeAdd('heroIconDomDarkPath');
    maybeAdd('heroIconDomDarkMime');
    maybeAdd('heroIconDomDarkName');
    maybeAdd('heroIconMierLightPath');
    maybeAdd('heroIconMierLightMime');
    maybeAdd('heroIconMierLightName');
    maybeAdd('heroIconMierDarkPath');
    maybeAdd('heroIconMierDarkMime');
    maybeAdd('heroIconMierDarkName');
    // Header fade colors (day/night)
    maybeAdd('heroFadeEnabled', 'INTEGER');
    maybeAdd('heroFadeLightColor');
    maybeAdd('heroFadeDarkColor');
    // Header background colors (day/night)
    maybeAdd('heroBgLightColor');
    maybeAdd('heroBgDarkColor');
  } catch (_) {}
}
