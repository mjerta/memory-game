#!/usr/bin/env python3
"""Generate localized card-name WAVs for every supported game language."""

from __future__ import annotations

import array
import json
import shutil
import subprocess
import tempfile
import urllib.request
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "tools" / "voices"
PIPER = ROOT / ".venv" / "bin" / "piper"
PIPER_VOICES = {
    "en": ("en_US-ryan-high", "en/en_US/ryan/high"),
    "nl": ("nl_NL-pim-medium", "nl/nl_NL/pim/medium"),
    "de": ("de_DE-thorsten-high", "de/de_DE/thorsten/high"),
    "fr": ("fr_FR-tom-medium", "fr/fr_FR/tom/medium"),
    "es": ("es_ES-davefx-medium", "es/es_ES/davefx/medium"),
}
PIPER_BASE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/"
MMS_BASE_URL = "https://huggingface.co/willwade/mms-tts-multilingual-models-onnx/resolve/4f49fc254f11ddb0e35fbf25b6e48b04463a6779/tgl/"


def download_if_missing(url: str, destination: Path) -> None:
    if destination.exists():
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {destination.name}...")
    urllib.request.urlretrieve(url, destination)


def convert_to_web_wav(source: Path, destination: Path, ffmpeg: str) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
            "-af", "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_threshold=-45dB:stop_duration=0.08",
            "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", str(destination),
        ],
        check=True,
    )


def card_name(card: dict, language: str, localized_names: dict) -> str:
    if language == "en":
        return card["name"]
    return localized_names[language][str(card["id"])]


def piper_model(language: str) -> tuple[Path, Path]:
    name, relative_model_path = PIPER_VOICES[language]
    model = MODEL_DIR / f"{name}.onnx"
    config = MODEL_DIR / f"{name}.onnx.json"
    base_url = PIPER_BASE_URL + relative_model_path + "/"
    download_if_missing(base_url + model.name, model)
    download_if_missing(base_url + config.name, config)
    return model, config


def generate_piper_language(
    language: str, cards: list[dict], localized_names: dict, ffmpeg: str, temp_dir: Path
) -> None:
    model, config = piper_model(language)
    input_file = temp_dir / f"{language}-names.txt"
    names = [card_name(card, language, localized_names) for card in cards]
    input_file.write_text("\n".join(names) + "\n", encoding="utf-8")
    generated_dir = temp_dir / language
    generated_dir.mkdir()
    subprocess.run(
        [
            str(PIPER), "--model", str(model), "--config", str(config),
            "--input-file", str(input_file), "--output-dir", str(generated_dir),
            "--output-dir-naming", "text", "--sentence-silence", "0.05",
        ],
        check=True,
    )
    write_language_assets(language, cards, names, generated_dir, ffmpeg)


def write_language_assets(
    language: str, cards: list[dict], names: list[str], generated_dir: Path, ffmpeg: str
) -> None:
    output_dir = ROOT / "public" / "audio" / language
    for card, name in zip(cards, names, strict=True):
        generated = generated_dir / f"{name}.wav"
        if not generated.exists():
            raise SystemExit(f"No synthesized clip found for {language}:{name!r}")
        destination = output_dir / f"{card['id']}.wav"
        convert_to_web_wav(generated, destination, ffmpeg)
        print(f"{language} {card['id']:>2}  {name:<18} {destination.stat().st_size:>7} bytes")


def write_float_wav(path: Path, samples: list[float], sample_rate: int) -> None:
    pcm = array.array("h", (max(-32768, min(32767, round(value * 32767))) for value in samples))
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(sample_rate)
        output.writeframes(pcm.tobytes())


def generate_tagalog(
    cards: list[dict], localized_names: dict, ffmpeg: str, temp_dir: Path
) -> None:
    try:
        import sherpa_onnx
    except ImportError as error:
        raise SystemExit("Install Tagalog TTS support with: .venv/bin/pip install sherpa-onnx") from error

    model_dir = MODEL_DIR / "mms-tgl"
    model = model_dir / "model.onnx"
    tokens = model_dir / "tokens.txt"
    download_if_missing(MMS_BASE_URL + "model.onnx", model)
    download_if_missing(MMS_BASE_URL + "tokens.txt", tokens)

    config = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=str(model), tokens=str(tokens)),
            provider="cpu",
            num_threads=2,
        )
    )
    if not config.validate():
        raise SystemExit("The Tagalog MMS TTS model configuration is invalid")
    engine = sherpa_onnx.OfflineTts(config)
    names = [card_name(card, "tl", localized_names) for card in cards]
    generated_dir = temp_dir / "tl"
    generated_dir.mkdir()
    for name in names:
        audio = engine.generate(name)
        if not audio.samples:
            raise SystemExit(f"Tagalog model generated no audio for {name!r}")
        write_float_wav(generated_dir / f"{name}.wav", audio.samples, audio.sample_rate)
    write_language_assets("tl", cards, names, generated_dir, ffmpeg)


def main() -> None:
    if not PIPER.exists():
        raise SystemExit("Piper not installed. Run: python3 -m venv .venv && .venv/bin/pip install piper-tts")
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise SystemExit("ffmpeg is required to convert generated audio.")

    cards = json.loads((ROOT / "public" / "cards" / "cards.json").read_text(encoding="utf-8"))
    localized_names = json.loads((ROOT / "src" / "app" / "i18n" / "card-names.json").read_text(encoding="utf-8"))
    if not cards or any(str(card["id"]) not in localized_names["tl"] for card in cards):
        raise SystemExit("Card-name translations are missing or the card catalog is empty")

    with tempfile.TemporaryDirectory(prefix="memory-game-tts-") as temp:
        temp_dir = Path(temp)
        for language in PIPER_VOICES:
            generate_piper_language(language, cards, localized_names, ffmpeg, temp_dir)
        generate_tagalog(cards, localized_names, ffmpeg, temp_dir)

    total = sum(1 for _ in (ROOT / "public" / "audio").glob("*/*.wav"))
    print(f"Generated {total} localized clips across 6 languages")


if __name__ == "__main__":
    main()
