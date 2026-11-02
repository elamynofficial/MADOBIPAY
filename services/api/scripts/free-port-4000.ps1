$conns = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
if (-not $conns) {
  Write-Host 'Port 4000 is free.'
  exit 0
}
$conns | ForEach-Object {
  Write-Host "Stopping PID $($_.OwningProcess) on port 4000"
  Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1
Write-Host 'Port 4000 should be free. Run: npm run dev'
