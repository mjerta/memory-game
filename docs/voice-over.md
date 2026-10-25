# Voice-over and card-name audio

The game speaks a card's localized name when that card is turned face-up. Audio is generated ahead of time and shipped as static WAV assets; the browser does not call a TTS service.

## Playback behavior

- Audio follows the selected UI language: `en`, `nl`, `de`, `fr`, `es`, or `tl`.
- A spoken name starts on every card opening, including cards that will form a match.
- Closing an already-open card, flipping cards back after a mismatch, and resetting the board do not speak.
- Only one clip plays at a time. Opening another card stops and rewinds the previous clip.
- The **Sound** button in the expanded header menu toggles playback. Sound is on by default; the choice is stored in `localStorage` as `memory-game-sound`. Muting also stops a clip already in progress.
- If an audio file is missing or the browser cannot play it, the game continues silently.

`AudioService` maps `(language, cardId)` to `/audio/<language>/<cardId>.wav`. The card ID is the catalog ID in `public/cards/cards.json`; the matching localized spoken name is in `src/app/i18n/card-names.json`. English names are read directly from the card catalog.

## Audio assets and caching

There are 54 clips per language, 324 WAV files total, in these folders:

```text
public/audio/en/1.wav
public/audio/nl/1.wav
public/audio/de/1.wav
public/audio/fr/1.wav
public/audio/es/1.wav
public/audio/tl/1.wav
```

Each clip is trimmed and converted to **16 kHz, mono, 16-bit PCM WAV**. The audio asset group in `ngsw-config.json` uses lazy install/update modes: WAVs are not downloaded with the app shell, and the service worker caches each file as it is requested.

## Regenerating clips

Requirements: Python 3, `ffmpeg`, Piper, and Sherpa-ONNX. On Linux, install the Python packages and run:

```bash
python3 -m venv .venv
.venv/bin/pip install piper-tts sherpa-onnx
.venv/bin/python scripts/generate-card-audio.py
```

The script reads English card names from `public/cards/cards.json` and translated names from `src/app/i18n/card-names.json`. It downloads missing voice models to `tools/voices/` (gitignored), synthesizes the names, converts the audio, and writes the WAVs into `public/audio/<language>/`. Running it again replaces the generated clips.

Piper voices used:

| Language | Voice | Model source |
| --- | --- | --- |
| English | Ryan, high | [Piper model](https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/en/en_US/ryan/high) |
| Dutch | Pim, medium | [Piper model](https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/nl/nl_NL/pim/medium) |
| German | Thorsten, high | [Piper model](https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/de/de_DE/thorsten/high) |
| French | Tom, medium | [Piper model](https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/fr/fr_FR/tom/medium) |
| Spanish | DaveFX, medium | [Piper model](https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/es/es_ES/davefx/medium) |
| Tagalog | Meta MMS-TTS via Sherpa-ONNX | [Pinned ONNX model](https://huggingface.co/willwade/mms-tts-multilingual-models-onnx/tree/4f49fc254f11ddb0e35fbf25b6e48b04463a6779/tgl) |

Tagalog's available model is single-speaker and does not document the speaker's gender, so a male voice cannot be guaranteed for Tagalog. The other selected Piper voices are male voices.

## Adding a language

1. Add its code to `Language` and `LANGUAGES` in `src/app/i18n/languages.ts`.
2. Add all 54 card-ID-to-name translations to `src/app/i18n/card-names.json`.
3. For a Piper voice, add its model name and pinned repository path to `PIPER_VOICES` in `scripts/generate-card-audio.py`. For a non-Piper voice, add a generation function alongside `generate_tagalog`.
4. Add that language's clips by running the generator. `AudioService` already builds paths using the selected language, and the service-worker `/audio/**` pattern already includes the new files.
5. Add a test for the new clip path and verify the generated folder contains all 54 files.

## Voice licenses

Voice/model terms differ from the TTS engine's license and may constrain redistribution or commercial use. Review upstream terms before using the assets outside this non-commercial project:

- Ryan's model card identifies **CC BY-NC-SA 4.0** for its training dataset.
- Pim, Thorsten, and DaveFX model cards identify **CC0** for their training datasets.
- Tom's model card identifies **AGPLv3**.
- MMS-TTS is **CC BY-NC 4.0**.

The WAV clips are generated from these models and are committed with the app; do not assume that the generated audio is free of the model or dataset's restrictions. The voice model binaries themselves are not committed.
