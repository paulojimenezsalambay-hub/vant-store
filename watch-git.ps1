# watch-git.ps1
# Hace un commit automatico cada vez que se detecta un cambio en el proyecto.

$PROJECT_DIR = $PSScriptRoot

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  VANT STORE - Auto Git Commit" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Vigilando cambios en: $PROJECT_DIR" -ForegroundColor White
Write-Host "Cada modificacion generara un commit automatico." -ForegroundColor White
Write-Host "Pulsa Ctrl+C para detener." -ForegroundColor DarkGray
Write-Host ""

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $PROJECT_DIR
$watcher.Filter = "*.*"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $false

# Extensiones y carpetas a ignorar
$IGNORE_DIRS  = @('.git', '.claude', 'node_modules')
$IGNORE_FILES = @('watch-git.ps1', 'watch-products.ps1')

function Should-Ignore {
  param([string]$Path)
  foreach ($dir in $IGNORE_DIRS) {
    if ($Path -like "*\$dir\*" -or $Path -like "*\$dir") { return $true }
  }
  $name = Split-Path $Path -Leaf
  if ($IGNORE_FILES -contains $name) { return $true }
  return $false
}

function Do-Commit {
  param([string]$ChangedFile)

  Start-Sleep -Milliseconds 800  # espera a que terminen de escribirse los archivos

  # Comprobar si hay cambios reales
  $status = & git -C $PROJECT_DIR status --porcelain 2>$null
  if (-not $status) { return }

  # Filtrar lineas ignoradas
  $relevant = $status | Where-Object { $_ -notmatch '\.git' }
  if (-not $relevant) { return }

  $fileName = Split-Path $ChangedFile -Leaf
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $msg = "Auto: $fileName actualizado [$timestamp]"

  & git -C $PROJECT_DIR add . 2>$null
  $result = & git -C $PROJECT_DIR commit -m $msg 2>&1

  if ($LASTEXITCODE -eq 0) {
    Write-Host "[GIT] $msg" -ForegroundColor Green
  }
}

# Debounce: evitar multiples commits por el mismo guardado
$lastCommit   = [DateTime]::MinValue
$pendingFile  = $null
$DEBOUNCE_MS  = 2000

$watcher.EnableRaisingEvents = $true

Write-Host "Listo. Esperando cambios..." -ForegroundColor Green
Write-Host ""

try {
  while ($true) {
    $ev = $watcher.WaitForChanged([System.IO.WatcherChangeTypes]::All, 1000)

    if (-not $ev.TimedOut) {
      $fullPath = Join-Path $PROJECT_DIR $ev.Name

      if (-not (Should-Ignore $fullPath)) {
        $pendingFile = $fullPath
      }
    }

    # Commit si hay algo pendiente y han pasado los ms de debounce
    if ($pendingFile -and ([DateTime]::Now - $lastCommit).TotalMilliseconds -gt $DEBOUNCE_MS) {
      Do-Commit -ChangedFile $pendingFile
      $pendingFile  = $null
      $lastCommit   = [DateTime]::Now
    }
  }
} finally {
  $watcher.EnableRaisingEvents = $false
  $watcher.Dispose()
  Write-Host "Auto-commit detenido." -ForegroundColor DarkGray
}
