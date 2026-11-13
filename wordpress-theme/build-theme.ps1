# Builds skrine-theme.zip, ready for WordPress > Appearance > Themes > Add New > Upload Theme.
#
# Copies the design's CSS, JS and the images the homepage needs from "new design"
# into skrine/assets (so there is one source of truth: edit "new design", rebuild).
#
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File wordpress-theme\build-theme.ps1

$ErrorActionPreference = 'Stop'
$here   = Split-Path -Parent $MyInvocation.MyCommand.Path
$design = Join-Path (Split-Path -Parent $here) 'new design'
$theme  = Join-Path $here 'skrine'
$assets = Join-Path $theme 'assets'
$zip    = Join-Path $here 'skrine-theme.zip'
$importCount = 10   # keep in step with SKRINE_IMPORT_NEWS_COUNT in inc/import.php

# 1. Fresh assets folder
if (Test-Path $assets) { Remove-Item $assets -Recurse -Force }
New-Item -ItemType Directory -Force (Join-Path $assets 'images\news') | Out-Null

Copy-Item (Join-Path $design 'css') $assets -Recurse
Copy-Item (Join-Path $design 'js')  $assets -Recurse

# The scripts are written for the static site (relative paths, data files).
# Adjust the theme's COPIES so WordPress can supply paths and content; the list of
# find/replace pairs is in tools/js-patches.json. The originals are never modified.
$patches = Get-Content (Join-Path $here 'tools\js-patches.json') -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($prop in $patches.PSObject.Properties) {
    if ($prop.Name.StartsWith('_')) { continue }
    $file = Join-Path $assets "js\$($prop.Name)"
    $js = [IO.File]::ReadAllText($file)
    foreach ($pair in $prop.Value) {
        if (-not $js.Contains($pair[0])) { throw "$($prop.Name) has changed; could not find: $($pair[0])" }
        $js = $js.Replace($pair[0], $pair[1])
    }
    [IO.File]::WriteAllText($file, $js, (New-Object Text.UTF8Encoding $false))
}
$homeJs = [IO.File]::ReadAllText((Join-Path $assets 'js\home.js'))
if ($homeJs.Contains('new%20design/images') -or $homeJs.Contains('new%20design/news-events')) { throw 'home.js still has hard-coded paths' }

# 2. Images: top-level files plus the folders the pages use
Get-ChildItem (Join-Path $design 'images') -File | Copy-Item -Destination (Join-Path $assets 'images')
foreach ($dir in 'bg', 'practice', 'sectors', 'publications', 'awards') {
    Copy-Item (Join-Path $design "images\$dir") (Join-Path $assets 'images') -Recurse
}
# Lawyer photos for author chips on alert pages (the design keeps them in "current design")
Copy-Item (Join-Path (Split-Path -Parent $here) 'current design\images\people') (Join-Path $assets 'images') -Recurse

# Only the news images the importer will use
$newsJs = Get-Content (Join-Path $design 'js\news-data.js') -Raw -Encoding UTF8
$images = [regex]::Matches($newsJs, '"image":\s*"([^"]+)"') | Select-Object -First $importCount | ForEach-Object { $_.Groups[1].Value }
foreach ($img in $images) {
    $src = Join-Path $design "images\news\$img"
    if (Test-Path $src) { Copy-Item $src (Join-Path $assets 'images\news') }
}

# 3. Zip with forward-slash paths (WordPress on Linux needs these)
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
if (Test-Path $zip) { Remove-Item $zip -Force }
$archive = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
try {
    Get-ChildItem $theme -Recurse -File | ForEach-Object {
        $rel = 'skrine/' + $_.FullName.Substring($theme.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $rel, 'Optimal') | Out-Null
    }
} finally {
    $archive.Dispose()
}

$mb = [math]::Round((Get-Item $zip).Length / 1MB, 1)
Write-Host "Built $zip ($mb MB)"
