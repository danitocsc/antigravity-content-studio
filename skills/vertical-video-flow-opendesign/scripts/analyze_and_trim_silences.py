#!/usr/bin/env python3
"""
Auditoría de espectrograma y energía RMS (-37.0 dBFS en ventanas de 50 ms)
para detectar y recortar silencios muertos en las uniones de clips de video (ej. Google Flow 3x10s).
"""
import argparse
import math
import os
import struct
import subprocess
import wave
from typing import List, Tuple


def analyze_clip_speech(
    video_path: str,
    threshold_db: float = -37.0,
    window_sec: float = 0.05,
    pad_sec: float = 0.10,
    min_internal_gap_sec: float = 0.65,
) -> List[Tuple[float, float]]:
    """Devuelve la lista de intervalos (inicio, fin) con voz activa dentro de un clip MP4."""
    tmp_wav = f"{video_path}.tmp16k.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-i", video_path, "-vn", "-ac", "1", "-ar", "16000", tmp_wav, "-loglevel", "error"],
        check=True,
    )
    with wave.open(tmp_wav, "rb") as w:
        n = w.getnframes()
        sr = w.getframerate()
        samples = struct.unpack(f"<{n}h", w.readframes(n))
    os.remove(tmp_wav)

    total_dur = n / sr
    win = int(sr * window_sec)
    dbs = []
    for i in range(0, len(samples), win):
        chunk = samples[i : i + win]
        rms = math.sqrt(sum(s * s for s in chunk) / len(chunk)) if chunk else 1.0
        db = 20.0 * math.log10(max(rms, 1.0) / 32768.0)
        dbs.append((i / sr, db))

    active_times = [t for t, db in dbs if db > threshold_db]
    if not active_times:
        return [(0.0, total_dur)]

    first_t = max(0.0, min(active_times) - pad_sec)
    last_t = min(total_dur, max(active_times) + window_sec + pad_sec)

    # Detectar silencios internos largos (>= min_internal_gap_sec) dentro del rango activo
    segments: List[Tuple[float, float]] = []
    cur_start = first_t
    in_sil = False
    sil_start = first_t

    for t, db in dbs:
        if t < first_t or t > last_t:
            continue
        if db <= threshold_db and not in_sil:
            in_sil = True
            sil_start = t
        elif db > threshold_db and in_sil:
            in_sil = False
            if (t - sil_start) >= min_internal_gap_sec:
                seg_end = min(total_dur, sil_start + pad_sec)
                if seg_end - cur_start >= 0.25:
                    segments.append((round(cur_start, 2), round(seg_end, 2)))
                cur_start = max(0.0, t - pad_sec)

    if last_t - cur_start >= 0.25:
        segments.append((round(cur_start, 2), round(last_t, 2)))

    return segments


def main() -> None:
    parser = argparse.ArgumentParser(description="Analiza espectrograma/RMS y recorta silencios en uniones de clips.")
    parser.add_argument("clips", nargs="+", help="Rutas de los clips MP4 en orden (ej. clip1.mp4 clip2.mp4 clip3.mp4)")
    parser.add_argument("-o", "--output", required=True, help="Ruta del MP4 resultante sin silencios en las uniones")
    parser.add_argument("--threshold-db", type=float, default=-37.0, help="Umbral en dBFS para voz activa (default: -37.0)")
    parser.add_argument("--width", type=int, default=1080, help="Ancho de salida (default: 1080)")
    parser.add_argument("--height", type=int, default=1920, help="Alto de salida (default: 1920)")
    args = parser.parse_args()

    all_segments = []
    for idx, clip in enumerate(args.clips, 1):
        segs = analyze_clip_speech(clip, threshold_db=args.threshold_db)
        print(f"[Clip {idx}] {clip} -> Segmentos activos: {segs}")
        for s_start, s_end in segs:
            all_segments.append((clip, s_start, s_end))

    cmd = ["ffmpeg", "-y", "-threads", "2"]
    filter_parts = []
    concat_inputs = []

    for i, (clip_path, s_start, s_end) in enumerate(all_segments):
        dur = max(0.1, s_end - s_start)
        fade_out_st = max(0.0, round(dur - 0.07, 2))
        cmd.extend(["-ss", str(s_start), "-to", str(s_end), "-i", clip_path])
        filter_parts.append(
            f"[{i}:v]scale={args.width}:{args.height}:flags=lanczos,fps=24,format=yuv420p,setsar=1[v{i}];"
            f"[{i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,"
            f"afade=t=in:st=0:d=0.05,afade=t=out:st={fade_out_st}:d=0.07[a{i}]"
        )
        concat_inputs.append(f"[v{i}][a{i}]")

    n_segs = len(all_segments)
    filter_complex = ";".join(filter_parts) + ";" + "".join(concat_inputs) + f"concat=n={n_segs}:v=1:a=1[v][a]"
    cmd.extend([
        "-filter_complex", filter_complex,
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-crf", "18", "-preset", "superfast",
        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
        args.output,
    ])
    subprocess.run(cmd, check=True)
    print(f"Video recortado y unido guardado en: {args.output}")


if __name__ == "__main__":
    main()
