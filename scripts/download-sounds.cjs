#!/usr/bin/env node

/**
 * Download relaxation sounds for Dreamwell app
 *
 * This script downloads royalty-free audio files from Freesound.org CDN
 * and saves them to public/sounds/ directory for local use.
 *
 * Usage:
 *   node scripts/download-sounds.js
 *   npm run download-sounds
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Sound files to download
const SOUNDS = {
  'rain.mp3': 'https://cdn.freesound.org/previews/513/513828_5121236-lq.mp3',
  'ocean.mp3': 'https://cdn.freesound.org/previews/234/234524_3905908-lq.mp3',
  'forest.mp3': 'https://cdn.freesound.org/previews/416/416529_5121236-lq.mp3',
  'white-noise.mp3': 'https://cdn.freesound.org/previews/191/191378_1015240-lq.mp3',
  'thunderstorm.mp3': 'https://cdn.freesound.org/previews/442/442578_907272-lq.mp3',
  'pink-noise.mp3': 'https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3',
  'piano.mp3': 'https://cdn.freesound.org/previews/456/456966_9497060-lq.mp3',
  'strings.mp3': 'https://cdn.freesound.org/previews/411/411459_2166768-lq.mp3',
  'gentle-wake.mp3': 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
  'morning-birds.mp3': 'https://cdn.freesound.org/previews/456/456965_9497060-lq.mp3',
};

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'sounds');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✓ Created directory: ${OUTPUT_DIR}`);
}

/**
 * Download a file from URL
 */
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(OUTPUT_DIR, filename);

    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⊘ Skipped ${filename} (already exists)`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filepath);

    console.log(`↓ Downloading ${filename}...`);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`✓ Downloaded ${filename} (${sizeKB} KB)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(new Error(`Failed to download ${filename}: ${err.message}`));
    });

    file.on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(new Error(`Failed to write ${filename}: ${err.message}`));
    });
  });
}

/**
 * Download all sound files
 */
async function downloadAllSounds() {
  console.log('\n🎵 Dreamwell Sound Downloader\n');
  console.log('Downloading relaxation sounds from Freesound.org...\n');

  const entries = Object.entries(SOUNDS);
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const [filename, url] of entries) {
    try {
      await downloadFile(url, filename);
      if (fs.existsSync(path.join(OUTPUT_DIR, filename))) {
        const stats = fs.statSync(path.join(OUTPUT_DIR, filename));
        if (stats.size > 0) {
          successCount++;
        } else {
          skipCount++;
        }
      }
    } catch (error) {
      console.error(`✗ Error downloading ${filename}:`, error.message);
      failCount++;
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`\n✓ Downloaded: ${successCount} files`);
  if (skipCount > 0) console.log(`⊘ Skipped: ${skipCount} files (already exist)`);
  if (failCount > 0) console.log(`✗ Failed: ${failCount} files`);
  console.log(`\n📁 Location: ${OUTPUT_DIR}\n`);

  if (failCount > 0) {
    console.log('⚠️  Some files failed to download.');
    console.log('   Check your internet connection and try again.');
    console.log('   Or download manually from: public/sounds/AUDIO_SOURCES.md\n');
    process.exit(1);
  }

  console.log('✅ All sound files downloaded successfully!');
  console.log('   The app will now use local files for better performance.\n');
}

// Run the script
downloadAllSounds().catch((error) => {
  console.error('\n❌ Download failed:', error.message);
  console.log('\n💡 Manual download instructions:');
  console.log('   See: public/sounds/AUDIO_SOURCES.md\n');
  process.exit(1);
});
