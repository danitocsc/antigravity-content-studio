#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DEST="${HOME}/.agents/skills"
PLUGINS_DEST="${HOME}/.gemini/config/plugins"

echo "=================================================================="
echo " Antigravity Content Studio · Instalador de Skills y Plugins"
echo "=================================================================="

mkdir -p "$SKILLS_DEST" "$PLUGINS_DEST"

for skill_dir in "$REPO_ROOT"/skills/*; do
  if [ -d "$skill_dir" ]; then
    skill_name="$(basename "$skill_dir")"
    rm -rf "${SKILLS_DEST:?}/${skill_name}"
    cp -r "$skill_dir" "${SKILLS_DEST}/${skill_name}"
    echo "[OK] Skill instalada: ${SKILLS_DEST}/${skill_name}"
  fi
done

if [ -d "$REPO_ROOT/plugins/antigravity-flow" ]; then
  rm -rf "${PLUGINS_DEST}/antigravity-flow"
  cp -r "$REPO_ROOT/plugins/antigravity-flow" "${PLUGINS_DEST}/antigravity-flow"
  echo "[OK] Plugin instalado: ${PLUGINS_DEST}/antigravity-flow"
fi

echo ""
echo "------------------------------------------------------------------"
echo " Verificación de dependencias del sistema"
echo "------------------------------------------------------------------"
for bin in git python3 ffmpeg ffprobe node npx; do
  if command -v "$bin" >/dev/null 2>&1; then
    echo "[OK] Binario disponible: $bin ($(command -v "$bin"))"
  else
    echo "[FALTA] Binario no encontrado: $bin"
  fi
done

python3 -c "import PIL; print('[OK] Python Pillow (PIL) disponible')" 2>/dev/null || echo "[OPCIONAL] Instala Pillow con: pip3 install Pillow"
python3 -c "import faster_whisper; print('[OK] Python faster-whisper disponible')" 2>/dev/null || echo "[OPCIONAL] Instala faster-whisper con: pip3 install faster-whisper"

echo ""
echo "Instalación completada. Revisa AGENT_SETUP.md y README.md para comenzar."
