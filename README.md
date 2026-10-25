# MemoryGame

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Spoken card names

Card names use localized WAV clips for English, Dutch, German, French, Spanish, and Tagalog. Files are in `public/audio/<language>/`; the service worker caches them lazily, so they do not download until played. See the [voice-over guide](docs/voice-over.md) for playback behavior, regeneration, adding languages, and voice licenses.

To regenerate the clips, install Piper and Sherpa-ONNX in a local virtual environment and run the generator (voice models are downloaded into a gitignored directory):

```bash
python3 -m venv .venv
.venv/bin/pip install piper-tts sherpa-onnx
.venv/bin/python scripts/generate-card-audio.py
```

`ffmpeg` is also required. Voices are Piper Ryan (English), Pim (Dutch), Thorsten (German), Tom (French), and DaveFX (Spanish); Tagalog uses Meta MMS-TTS. Voice-model licenses vary: the Ryan model card cites **CC BY-NC-SA 4.0**, the French Tom model card cites **AGPLv3**, and MMS-TTS is **CC BY-NC 4.0**. Check each upstream model card and keep generated assets within the applicable terms, especially for commercial use.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
