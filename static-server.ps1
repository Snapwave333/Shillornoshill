param(
    [int]$Port = 8080,
    [string]$Root = "c:\Users\chrom\OneDrive\Desktop\apps\New folder (3)"
)

Add-Type -AssemblyName System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Preview server running at ${prefix}game-master-settings.html"

try {
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $relativePath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }
        $fullPath = Join-Path $Root $relativePath

        if (-not (Test-Path $fullPath)) {
            $context.Response.StatusCode = 404
            $bytes = [Text.Encoding]::UTF8.GetBytes("Not Found")
            $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
            $context.Response.OutputStream.Close()
            continue
        }

        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
        switch ($ext) {
            '.html' { $context.Response.ContentType = 'text/html' }
            '.css'  { $context.Response.ContentType = 'text/css' }
            '.js'   { $context.Response.ContentType = 'application/javascript' }
            '.svg'  { $context.Response.ContentType = 'image/svg+xml' }
            '.png'  { $context.Response.ContentType = 'image/png' }
            '.jpg'  { $context.Response.ContentType = 'image/jpeg' }
            default { $context.Response.ContentType = 'application/octet-stream' }
        }
        $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
        $context.Response.OutputStream.Close()
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}