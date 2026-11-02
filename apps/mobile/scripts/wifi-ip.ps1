Write-Host 'Use the Wi-Fi IPv4 below in Expo Go (not 127.0.0.1, not localhost).'
Write-Host ''
Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
  ForEach-Object {
    '{0,-22} {1}' -f $_.InterfaceAlias, $_.IPAddress
  }
Write-Host ''
Write-Host 'In Expo Go tap Enter URL and use:'
Write-Host '  exp://YOUR-WIFI-IP:8081'
Write-Host 'Example if Wi-Fi is 192.168.1.10:'
Write-Host '  exp://192.168.1.10:8081'
Write-Host ''
Write-Host 'API must be running. Phone will call http://YOUR-WIFI-IP:4000'
