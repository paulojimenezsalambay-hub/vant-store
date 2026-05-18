# watch-products.ps1
# Arrastra imagenes a assets/products/ y las mueve a su subcarpeta automaticamente.

$PRODUCTS_DIR = Join-Path $PSScriptRoot "assets\products"

$SLUGS = @(
  'sauvage','acqua-di-gio','good-girl-blush','club-de-nuit-intense','ciel',
  'black-opium','la-vie-est-belle','jadore','coco-mademoiselle','lady-million',
  'olympea','libre','si','idole','1-million','phantom','invictus','y-edp',
  '212-vip-men','eros','bottled','sauvage-edt',
  'adidas-ice-dive','adidas-pure-game','adidas-victory-league',
  'ab-power-seduction','ab-golden-secret','ab-secret-absolu',
  'ab-icon-supreme-h','ab-icon-supreme-m',
  'ag-cloud','ag-thank-u-next',
  'armaf-cdni-edt','armaf-cdnu','armaf-artisto','armaf-mandarin-sky',
  'afnan-9pm','alhambra-immortel','alhambra-bright-peach','alhambra-porto-neroli',
  'alhambra-toscano','alhambra-rose-petals',
  'ad-citrus-cedro','adp-colonia-club',
  'rc-paradiso-azzurro','cartier-baiser-dragon',
  'af-first-instinct-w','agatha-love-forever','agatha-love-love','agatha-beso',
  'boss-hugo-extreme','af-fierce-cologne','af-first-instinct-m',
  'dunhill-desire-blue-150','dunhill-desire-blue-100','dunhill-desire-red',
  'ab-secret-night',
  'dior-addict-rosy','ck-one','lattafa-yara','cacharel-amor-amor',
  'britney-fantasy','dkny-women','zadig-this-is-her','lattafa-eclaire',
  'prada-paradoxe-intense','prada-paradoxe','cacharel-noa','dg-light-blue',
  'ch-good-girl-jasmine','halloween-edt','valentino-born-roma-w',
  'ck-eternity-w','dg-limperatrice','dg-devotion','tous-loveme-onyx',
  'rochas-audace','hoss-julieta',
  'givenchy-gentleman-ambree','armani-stronger-intensely','issey-leau-homme',
  'valentino-born-roma-m','lattafa-asad','jpgaultier-le-beau-edp',
  'davidoff-cool-water','lattafa-asad-bourbon','armaf-mandarin-elixir',
  'french-avenue-vulcan','montblanc-starwalker','armani-acqua-edt',
  'prada-paradigme','lattafa-khamrah','lattafa-fakhar','kenzo-homme-intense',
  'ch-212-men','armani-stronger-absolutely','versace-eros-edp','elie-saab-lhomme-intense'
)

$IMAGE_EXTS = @('.jpg','.jpeg','.png','.webp','.avif')

function Process-Image {
  param([System.IO.FileInfo]$file)

  $nameNoExt = $file.BaseName.ToLower()
  $ext = $file.Extension.ToLower()

  # 1) El nombre del archivo coincide exactamente con un slug
  $matchedSlug = $null
  if ($SLUGS -contains $nameNoExt) {
    $matchedSlug = $nameNoExt
  }

  # 2) El nombre contiene un slug (busca el mas largo primero)
  if (-not $matchedSlug) {
    foreach ($slug in ($SLUGS | Sort-Object { $_.Length } -Descending)) {
      if ($nameNoExt -like "*$slug*") {
        $matchedSlug = $slug
        break
      }
    }
  }

  # 3) No reconocido — pedir al usuario
  if (-not $matchedSlug) {
    Write-Host ""
    Write-Host "No reconoci el slug para: $($file.Name)" -ForegroundColor Yellow
    Write-Host "Slugs disponibles:" -ForegroundColor Cyan
    $SLUGS | ForEach-Object { Write-Host "  $_" }
    Write-Host ""
    $respuesta = Read-Host "Escribe el slug exacto (o Enter para saltar)"
    $respuesta = $respuesta.Trim().ToLower()
    if ($respuesta -and ($SLUGS -contains $respuesta)) {
      $matchedSlug = $respuesta
    } else {
      Write-Host "Saltado: $($file.Name)" -ForegroundColor Red
      return
    }
  }

  $destDir = Join-Path $PRODUCTS_DIR $matchedSlug
  if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
  }

  $destFile = Join-Path $destDir "product$ext"

  # Backup si ya existe
  if (Test-Path $destFile) {
    $i = 1
    while (Test-Path (Join-Path $destDir "product_backup$i$ext")) { $i++ }
    Rename-Item -Path $destFile -NewName "product_backup$i$ext"
    Write-Host "  Backup: product_backup$i$ext" -ForegroundColor DarkGray
  }

  Move-Item -Path $file.FullName -Destination $destFile -Force
  Write-Host "[OK] $($file.Name)  ->  $matchedSlug\product$ext" -ForegroundColor Green
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  VANT STORE - Organizador de fotos de perfumes" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Arrastra imagenes a:  assets\products\" -ForegroundColor White
Write-Host "Se moveran solas a la subcarpeta correcta." -ForegroundColor White
Write-Host "Pulsa Ctrl+C para salir." -ForegroundColor DarkGray
Write-Host ""

# Bucle principal: revisa cada segundo si hay imagenes nuevas en la raiz
while ($true) {
  $files = Get-ChildItem -Path $PRODUCTS_DIR -File -ErrorAction SilentlyContinue |
           Where-Object { $IMAGE_EXTS -contains $_.Extension.ToLower() }

  foreach ($f in $files) {
    # Esperar a que el archivo este completamente copiado
    $ready = $false
    for ($i = 0; $i -lt 10; $i++) {
      try {
        $stream = [System.IO.File]::Open($f.FullName, 'Open', 'Read', 'None')
        $stream.Close()
        $ready = $true
        break
      } catch {
        Start-Sleep -Milliseconds 200
      }
    }
    if ($ready) {
      Process-Image -file $f
    }
  }

  Start-Sleep -Seconds 1
}
