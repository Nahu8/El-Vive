import { dbGet, dbRun } from '../db/index.js';

/** Portable upsert for section_icons (SQLite + MySQL/MariaDB). */
export async function upsertSectionIcon(pageKey, sectionKey, imagePath, imageMime, imageName) {
  const existing = await dbGet('SELECT id FROM section_icons WHERE page_key=? AND section_key=?', [
    pageKey,
    sectionKey,
  ]);
  if (existing) {
    await dbRun(
      "UPDATE section_icons SET imagePath=?, imageMime=?, imageName=?, updated_at=datetime('now') WHERE page_key=? AND section_key=?",
      [imagePath, imageMime, imageName, pageKey, sectionKey]
    );
  } else {
    await dbRun(
      'INSERT INTO section_icons (page_key, section_key, imagePath, imageMime, imageName) VALUES (?,?,?,?,?)',
      [pageKey, sectionKey, imagePath, imageMime, imageName]
    );
  }
}
