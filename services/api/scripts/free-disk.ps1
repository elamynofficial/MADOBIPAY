# Safe cache cleanup so npm/tsx can write again. Does not delete MADOBIPAY source.
$ErrorActionPreference = 'SilentlyContinue'

function FolderSizeMB($path) {
  if (-not (Test-Path $path)) { return 0 }
  [math]::Round(((Get-ChildItem $path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB), 1)
}

Write-Host 'Drive C: before'
Get-PSDrive C | Select-Object Used, Free | Format-List

$targets = @(
  "$env:LOCALAPPDATA\npm-cache",
  "$env:LOCALAPPDATA\npm-cache\_npx",
  "$env:TEMP",
  "$env:LOCALAPPDATA\Temp",
  "$env:USERPROFILE\.expo",
  "C:\Users\elmuj\MADOBIPAY\apps\mobile\.expo",
  "C:\Users\elmuj\MADOBIPAY\node_modules"
)

foreach ($t in $targets) {
  if (Test-Path $t) {
    $mb = FolderSizeMB $t
    Write-Host "Removing $t (~${mb} MB)"
    Remove-Item -LiteralPath $t -Recurse -Force -ErrorAction SilentlyContinue
  }
}

npm cache clean --force 2>$null

Write-Host 'Drive C: after'
Get-PSDrive C | Select-Object Used, Free | Format-List
Write-Host 'Empty Recycle Bin in Explorer if Free is still low.'
Write-Host 'Then: cd C:\Users\elmuj\MADOBIPAY\services\api ; npx tsx src/index.ts'
