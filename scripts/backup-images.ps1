param(
    [string]$Root = ".",
    [string]$BackupRoot = "backups/originals"
)

$imagePatterns = @('*.png','*.jpg','*.jpeg','*.webp')
$files = Get-ChildItem -Path $Root -Recurse -File -Include $imagePatterns

foreach ($f in $files) {
    $relPath = Resolve-Path $f.FullName | ForEach-Object { $_.Path.Replace((Resolve-Path $Root).Path, '').TrimStart('\','/') }
    $destPath = Join-Path $BackupRoot $relPath
    $destDir = Split-Path $destPath -Parent
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    Copy-Item -Path $f.FullName -Destination $destPath -Force
}

Write-Output "Backed up $($files.Count) image(s) to $BackupRoot"