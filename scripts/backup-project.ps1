param(
    [string]$OutputDir = "backups",
    [string]$NamePrefix = "project"
)

$ErrorActionPreference = "Stop"

$root = Get-Location
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$zipName = "$NamePrefix-$timestamp.zip"
$backupDir = Join-Path $root $OutputDir
if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
$tempDir = Join-Path $env:TEMP "project-backup-$timestamp"

try {
    New-Item -ItemType Directory -Path $tempDir | Out-Null

    # Exclusions
    $excludeDirs = @(".git", "node_modules", $OutputDir, ".vscode", ".idea")
    $excludeFiles = @("*.tmp", "*.log", "*.DS_Store", "Thumbs.db")

    # Build robocopy args to mirror project into temp dir
    $xdArgs = $excludeDirs | ForEach-Object { "/XD", (Join-Path $root $_) }
    $xfArgs = $excludeFiles | ForEach-Object { "/XF", $_ }
    $commonArgs = @("/MIR","/NFL","/NDL","/NJH","/NJS","/NP","/MT:8")

    $args = @($root, $tempDir) + $commonArgs + $xdArgs + $xfArgs
    $robocopy = Start-Process -FilePath "robocopy.exe" -ArgumentList $args -NoNewWindow -Wait -PassThru
    # Robocopy exit codes: 0-7 are success/warnings
    if ($robocopy.ExitCode -gt 7) { throw "Robocopy failed with exit code $($robocopy.ExitCode)" }

    # Create zip from temp directory
    $zipPath = Join-Path $backupDir $zipName
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

    Write-Host "Backup created: $zipPath"
}
finally {
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir
    }
}

# Usage:
#   pwsh ./scripts/backup-project.ps1
# Optional parameters:
#   pwsh ./scripts/backup-project.ps1 -OutputDir backups -NamePrefix project