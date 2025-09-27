param(
    [string]$Root = "."
)

Add-Type -AssemblyName System.Drawing

function Get-RelativePath([string]$fullPath, [string]$basePath) {
    $uriFull = New-Object System.Uri((Resolve-Path $fullPath))
    $uriBase = New-Object System.Uri((Resolve-Path $basePath))
    $rel = $uriBase.MakeRelativeUri($uriFull).ToString()
    return [System.Uri]::UnescapeDataString($rel)
}

$imagePatterns = @('*.png','*.jpg','*.jpeg','*.webp')
$images = Get-ChildItem -Path $Root -Recurse -File -Include $imagePatterns | Sort-Object FullName

$htmlFiles = Get-ChildItem -Path $Root -Recurse -File -Include '*.html','*.htm'

$result = @()
foreach ($imgFile in $images) {
    try {
        $img = [System.Drawing.Image]::FromFile($imgFile.FullName)
        $width = $img.Width
        $height = $img.Height
        $format = $img.RawFormat.ToString()
        $img.Dispose()
    } catch {
        $width = $null; $height = $null; $format = $null
    }

    $references = @()
    foreach ($html in $htmlFiles) {
        try {
            $matches = Select-String -Path $html.FullName -Pattern [Regex]::Escape($imgFile.Name) -SimpleMatch -List
            if ($matches) {
                $references += (Get-RelativePath $html.FullName $Root)
            }
        } catch {}
    }

    $result += [PSCustomObject]@{
        filename = (Get-RelativePath $imgFile.FullName $Root)
        width = $width
        height = $height
        aspect_ratio = if ($width -and $height -and $height -ne 0) { [math]::Round($width / $height, 4) } else { $null }
        format = $format
        referenced_in = $references | Sort-Object -Unique
    }
}

$result | ConvertTo-Json -Depth 5