param(
    [switch]$Force
)

# PowerShell: because typing less is a lifestyle.

$pkg = Get-Content -Raw package.json | ConvertFrom-Json
if (-not $pkg.version) { throw 'package.json version not found' }
$tag = "v$($pkg.version)"

$inRepo = git rev-parse --is-inside-work-tree
if ($inRepo.Trim() -ne 'true') { throw 'Not inside a Git repository' }

try { $originUrl = git remote get-url origin } catch { throw 'Git remote "origin" not found. Add it before tagging.' }

$hasLocal = git tag -l $tag

if ($Force) {
    if ($hasLocal) { git tag -d $tag }
    try { git push origin ":refs/tags/$tag" } catch {}
}

if (-not $hasLocal -or $Force) {
    Write-Host "Creating tag $tag"
    git tag $tag
} else {
    Write-Host "Tag $tag already exists locally."
}

Write-Host "Pushing $tag to origin ($originUrl)"
git push origin $tag
Write-Host "Done: $tag pushed."