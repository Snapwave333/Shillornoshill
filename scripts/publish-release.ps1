param(
    [string]$Owner = 'Snapwave333',
    [string]$Repo = 'Shillornoshill',
    [string]$Tag = "v$((Get-Content -Raw package.json | ConvertFrom-Json).version)",
    [string]$BodyFile = 'RELEASE_NOTES.md',
    [switch]$Draft
)

# PowerShell: because typing less is a lifestyle.

if (-not $env:GITHUB_TOKEN) {
    Write-Host 'GITHUB_TOKEN is required to publish release notes.' -ForegroundColor Red
    exit 2
}

if (-not (Test-Path -LiteralPath $BodyFile)) {
    Write-Host "Body file not found: $BodyFile" -ForegroundColor Red
    exit 3
}

$body = Get-Content -Raw -LiteralPath $BodyFile
$headers = @{ 'Authorization' = "Bearer $($env:GITHUB_TOKEN)"; 'Accept' = 'application/vnd.github+json' }
$createUri = "https://api.github.com/repos/$Owner/$Repo/releases"

$payload = @{ tag_name = $Tag; name = $Tag; body = $body; draft = [bool]$Draft; prerelease = $false }
$json = $payload | ConvertTo-Json -Depth 4

try {
    $existing = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/tags/$Tag" -Headers $headers -Method Get -ErrorAction SilentlyContinue
} catch { $existing = $null }

if ($existing) {
    Write-Host "Updating existing release: $Tag" -ForegroundColor Cyan
    $updateUri = "https://api.github.com/repos/$Owner/$Repo/releases/$($existing.id)"
    $resp = Invoke-RestMethod -Uri $updateUri -Headers $headers -Method Patch -Body $json -ContentType 'application/json'
} else {
    Write-Host "Creating release: $Tag" -ForegroundColor Cyan
    $resp = Invoke-RestMethod -Uri $createUri -Headers $headers -Method Post -Body $json -ContentType 'application/json'
}

if ($resp -and $resp.html_url) {
    Write-Host "Release published: $($resp.html_url)" -ForegroundColor Green
    exit 0
} else {
    Write-Host 'Failed to publish release.' -ForegroundColor Red
    exit 1
}