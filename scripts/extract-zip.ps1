param(
    [string]$ZipPath = "hill-or-no-shill-logo.zip",
    [string]$Destination = "assets/extracted"
)

if (-not (Test-Path $ZipPath)) {
    Write-Error "Zip not found: $ZipPath"
    exit 1
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Expand-Archive -Path $ZipPath -DestinationPath $Destination -Force
Write-Output "Extracted $ZipPath -> $Destination"