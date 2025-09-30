param(
    [string]$Owner = 'Snapwave333',
    [string]$Repo = 'Shillornoshill',
    [string]$Tag = 'v1.1.2',
    [switch]$Wait,
    [int]$IntervalSeconds = 30,
    [int]$MaxAttempts = 240
)

# PowerShell: because typing less is a lifestyle.

function Get-GitHubReleaseByTag {
    param(
        [string]$Owner,
        [string]$Repo,
        [string]$Tag
    )
    $headers = @{ 'User-Agent' = 'MaxSoft-Agent'; 'Accept' = 'application/vnd.github+json' }
    if ($env:GITHUB_TOKEN) { $headers['Authorization'] = "Bearer $($env:GITHUB_TOKEN)" }
    $uri = "https://api.github.com/repos/$Owner/$Repo/releases/tags/$Tag"
    try {
        return Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -ErrorAction Stop
    } catch {
        Write-Host "GitHub release for '$Tag' not available yet (HTTP error)." -ForegroundColor Yellow
        return $null
    }
}

function Try-DownloadReleaseAsset {
    param(
        [string]$Owner,
        [string]$Repo,
        [string]$Tag
    )
    $release = Get-GitHubReleaseByTag -Owner $Owner -Repo $Repo -Tag $Tag
    if (-not $release) { return $false }
    if ($release.draft -eq $true) {
        Write-Host "Release '$Tag' is still in draft. Waiting..." -ForegroundColor Yellow
        return $false
    }
    $asset = $release.assets | Where-Object { $_.name -like '*.exe' }
    if (-not $asset) {
        Write-Host "No .exe asset found yet for '$Tag'. Waiting..." -ForegroundColor Yellow
        return $false
    }
    $downloadUrl = $asset.browser_download_url
    $desktop = Join-Path $env:UserProfile 'OneDrive\Desktop'
    if (-not (Test-Path -LiteralPath $desktop)) { $desktop = [Environment]::GetFolderPath('Desktop') }
    $outFile = Join-Path $desktop $asset.name
    Write-Host "Downloading $($asset.name) from GitHub Releases..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $outFile -UseBasicParsing
        if (Test-Path -LiteralPath $outFile) {
            Write-Host "Downloaded to: $outFile" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Download reported success but file missing: $outFile" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "Download failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

if ($Wait) {
    $attempt = 0
    Write-Host "Watching for GitHub release asset '$Tag'... (Interval: $IntervalSeconds s, Max: $MaxAttempts)" -ForegroundColor Cyan
    while ($attempt -lt $MaxAttempts) {
        $attempt++
        if (Try-DownloadReleaseAsset -Owner $Owner -Repo $Repo -Tag $Tag) { exit 0 }
        Start-Sleep -Seconds $IntervalSeconds
    }
    Write-Host "Timed out waiting for release asset '$Tag'." -ForegroundColor Yellow
    exit 6
} else {
    if (Try-DownloadReleaseAsset -Owner $Owner -Repo $Repo -Tag $Tag) { exit 0 } else { exit 1 }
}