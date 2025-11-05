# Dreamwell Relaxation Sounds - Audio Sources

This document provides links to download royalty-free audio files for the Dreamwell sleep app.

## Required Audio Files

The app needs 8 audio files in MP3 format. Download and save them to this directory (`public/sounds/`).

### 1. Rain (rain.mp3)
**Recommended Source:** [Freesound - Rain Ambience](https://freesound.org/people/InspectorJ/sounds/346700/)
- Artist: InspectorJ
- License: CC BY 4.0
- Duration: 2+ minutes (loopable)
- Alternative: [Rain Sound by SoundBible](http://soundbible.com/2015-Rain.html)

### 2. Ocean Waves (ocean.mp3)
**Recommended Source:** [Freesound - Ocean Waves](https://freesound.org/people/Luftrum/sounds/234524/)
- Artist: Luftrum
- License: CC0 (Public Domain)
- Duration: 2+ minutes
- Alternative: [Ocean Waves by SoundBible](http://soundbible.com/1935-Ocean-Waves.html)

### 3. Forest Ambience (forest.mp3)
**Recommended Source:** [Freesound - Forest Atmosphere](https://freesound.org/people/klankbeeld/sounds/416529/)
- Artist: klankbeeld
- License: CC0 (Public Domain)
- Duration: 2+ minutes
- Alternative: Search "forest ambience" on Freesound.org

### 4. Thunderstorm (thunderstorm.mp3)
**Recommended Source:** [Freesound - Thunder](https://freesound.org/people/juskiddink/sounds/442578/)
- Artist: juskiddink
- License: CC0 (Public Domain)
- Duration: 2+ minutes
- Alternative: [Thunderstorm by SoundBible](http://soundbible.com/1454-Thunderstorm.html)

### 5. White Noise (white-noise.mp3)
**Recommended Source:** [Freesound - White Noise](https://freesound.org/people/OwlStorm/sounds/191378/)
- Artist: OwlStorm
- License: CC0 (Public Domain)
- Duration: 1+ minute
- Alternative: Generate with Audacity (Generate > Noise > White)

### 6. Pink Noise (pink-noise.mp3)
**Recommended Source:** [Freesound - Pink Noise](https://freesound.org/people/klankbeeld/sounds/411089/)
- Artist: klankbeeld
- License: CC0 (Public Domain)
- Duration: 1+ minute
- Alternative: Generate with Audacity (Generate > Noise > Pink)

### 7. Piano (piano.mp3)
**Recommended Source:** [Freesound - Calm Piano](https://freesound.org/people/MusicLegends/sounds/456966/)
- Artist: MusicLegends
- License: CC BY 4.0
- Duration: 2+ minutes
- Alternative: Search "calm piano" or "peaceful piano" on Pixabay Music

### 8. Strings (strings.mp3)
**Recommended Source:** [Freesound - String Pad](https://freesound.org/people/unfa/sounds/411459/)
- Artist: unfa
- License: CC0 (Public Domain)
- Duration: 2+ minutes
- Alternative: Search "ambient strings" on Pixabay Music

### Bonus: Alarm Sounds

#### Gentle Wake (gentle-wake.mp3)
**Recommended Source:** [Freesound - Gentle Alarm](https://freesound.org/people/Timbre/sounds/320655/)
- Artist: Timbre
- License: CC BY 4.0
- Duration: 10-20 seconds
- Alternative: Soft bell or chime sound

#### Morning Birds (morning-birds.mp3)
**Recommended Source:** [Freesound - Birds Chirping](https://freesound.org/people/MusicLegends/sounds/456965/)
- Artist: MusicLegends
- License: CC BY 4.0
- Duration: 10-20 seconds
- Alternative: Search "birds morning" on Freesound

---

## Quick Download Guide

### Option 1: Use the provided download script
```bash
npm run download-sounds
```

### Option 2: Manual Download
1. Visit each "Recommended Source" link above
2. Download the audio file
3. Convert to MP3 if needed (use [CloudConvert](https://cloudconvert.com/))
4. Rename the file to match the filename above
5. Save to `public/sounds/` directory

### Option 3: Use Freesound.org Search
1. Go to [Freesound.org](https://freesound.org/)
2. Search for the sound type (e.g., "rain ambience")
3. Filter by license: "Creative Commons 0" for easiest usage
4. Download, rename, and save to `public/sounds/`

---

## File Requirements

- **Format:** MP3 (preferred) or OGG
- **Bitrate:** 128kbps or higher
- **Sample Rate:** 44.1kHz
- **Duration:** 2-10 minutes recommended (app loops automatically)
- **File Size:** Keep under 5MB per file for web performance

---

## License Attribution

If using CC BY (Creative Commons Attribution) sounds, you should:
1. Add attribution in your app's About/Settings page
2. Include artist name and link to original work
3. Specify the license (CC BY 4.0)

Example attribution text:
```
Sounds provided by:
- Rain: InspectorJ (freesound.org) - CC BY 4.0
- Ocean: Luftrum (freesound.org) - CC0
- [etc.]
```

---

## Alternative Sources

If Freesound links are broken, try these royalty-free sources:

1. **[Pixabay](https://pixabay.com/sound-effects/)** - CC0 sounds
2. **[Zapsplat](https://www.zapsplat.com/)** - Free with attribution
3. **[BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/)** - Free for personal use
4. **[YouTube Audio Library](https://studio.youtube.com/)** - Royalty-free music
5. **[Incompetech](https://incompetech.com/)** - Royalty-free music by Kevin MacLeod

---

## Generate Your Own Sounds

### Using Audacity (Free):
1. Download [Audacity](https://www.audacityteam.org/)
2. For White Noise: Generate > Noise > White (Duration: 60s)
3. For Pink Noise: Generate > Noise > Pink (Duration: 60s)
4. Export as MP3 (bitrate 128kbps)

### Using Online Generators:
- **[myNoise](https://mynoise.net/)** - Generate custom soundscapes
- **[Noisli](https://www.noisli.com/)** - Mix multiple sounds
- **[A Soft Murmur](https://asoftmurmur.com/)** - Ambient sound mixer

---

## Troubleshooting

**Audio not playing?**
- Check file paths are correct
- Ensure files are in MP3 format
- Check browser console for errors
- Try reducing file size if too large

**Poor quality?**
- Use 128kbps or higher bitrate
- Ensure 44.1kHz sample rate
- Find longer duration files for smoother loops

**Legal concerns?**
- Always verify license before using
- CC0 (Public Domain) is safest for commercial use
- CC BY requires attribution
- Document your sources

---

## Current Status

The app currently uses **CDN-hosted audio** from Freesound.org as fallback. For better performance and offline support, download local files using this guide.

**Priority:** Medium (app works with CDN but local files improve performance)
