# Antigravity Content Studio · Instalador Nativo para Windows (PowerShell)
$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsDest = Join-Path $HOME ".agents\skills"
$PluginsDest = Join-Path $HOME ".gemini\config\plugins"
$MotionDataDir = Join-Path $HOME "openmotion-data"

Write-Host "=================================================================="
Write-Host " Antigravity Content Studio · Instalador para Windows"
Write-Host "=================================================================="

New-Item -ItemType Directory -Force -Path $SkillsDest | Out-Null
New-Item -ItemType Directory -Force -Path $PluginsDest | Out-Null
New-Item -ItemType Directory -Force -Path $MotionDataDir | Out-Null

Get-ChildItem -Path (Join-Path $RepoRoot "skills") -Directory | ForEach-Object {
    $Dest = Join-Path $SkillsDest $_.Name
    if (Test-Path $Dest) { Remove-Item -Recurse -Force $Dest }
    Copy-Item -Recurse -Force $_.FullName $Dest
    Write-Host "[OK] Skill instalada: $Dest"
}

$FlowPluginSrc = Join-Path $RepoRoot "plugins\antigravity-flow"
if (Test-Path $FlowPluginSrc) {
    $FlowPluginDest = Join-Path $PluginsDest "antigravity-flow"
    if (Test-Path $FlowPluginDest) { Remove-Item -Recurse -Force $FlowPluginDest }
    Copy-Item -Recurse -Force $FlowPluginSrc $FlowPluginDest
    Write-Host "[OK] Plugin instalado: $FlowPluginDest"
}

Write-Host ""
Write-Host "------------------------------------------------------------------"
Write-Host " Verificando dependencias base"
Write-Host "------------------------------------------------------------------"
foreach ($cmd in @("git", "python", "ffmpeg", "ffprobe", "node", "npm")) {
    $found = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($found) {
        Write-Host "[OK] $cmd -> $($found.Source)"
    } else {
        Write-Host "[FALTA] $cmd no encontrado en PATH"
    }
}

Write-Host ""
Write-Host "Para instalar OpenMotion Studio + MCP + sus 8 skills en Windows, ejecuta:"
Write-Host "  npx --yes @openmotion/app@0.2.1 setup --host antigravity --skills-dir `"$SkillsDest`" --data-dir `"$MotionDataDir`""
Write-Host "Consulta REQUIREMENTS.md y AGENT_SETUP.md para registrar el servidor MCP."
