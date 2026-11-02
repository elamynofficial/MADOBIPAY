# Bind Metro + API host to the real Wi-Fi NIC (not Hyper-V 10.238.x).
$ErrorActionPreference = 'Continue'
$wifi = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object {
    $_.IPAddress -notlike '127.*' -and
    $_.IPAddress -notlike '169.254.*' -and
    $_.InterfaceAlias -match 'Wi-Fi|WiFi|Wireless|WLAN'
  } |
  Select-Object -First 1

if (-not $wifi) {
  $wifi = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -like '192.168.*' } |
    Select-Object -First 1
}

if (-not $wifi) {
  Write-Host 'Could not find a Wi-Fi IPv4. Connect the PC to Wi-Fi, then retry.'
  Write-Host 'Or in Expo Go use tunnel: npx expo start --tunnel --clear'
  exit 1
}

$ip = $wifi.IPAddress
Write-Host "Wi-Fi IP: $ip  ($($wifi.InterfaceAlias))"
Write-Host "Expo Go URL: exp://${ip}:8081"
Write-Host "Keep the API running on port 4000."
Write-Host ""

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
$env:EXPO_PUBLIC_LAN_IP = $ip
Set-Location $PSScriptRoot\..
npx expo start --clear --lan --port 8081
