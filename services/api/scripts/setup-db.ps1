# Sets up MADOBIPAY Postgres, then migrate + seed.
# From repo:  powershell -File services\api\scripts\setup-db.ps1
# From API:   powershell -File scripts\setup-db.ps1

$ErrorActionPreference = 'Stop'
$ApiDir = Resolve-Path (Join-Path $PSScriptRoot '..')
$RepoRoot = Resolve-Path (Join-Path $ApiDir '..\..')
$ComposeFile = Join-Path $RepoRoot 'docker-compose.yml'
$BootstrapSql = Join-Path $RepoRoot 'sql\bootstrap.sql'
$DatabaseUrl = 'postgres://madobipay:madobipay@localhost:5432/madobipay'

function Test-PortOpen([string]$HostName, [int]$Port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $client.Connect($HostName, $Port)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

function Wait-Postgres([int]$Seconds = 60) {
  for ($i = 0; $i -lt $Seconds; $i++) {
    if (Test-PortOpen '127.0.0.1' 5432) { return $true }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Invoke-MigrateAndSeed {
  Push-Location $ApiDir
  try {
    if (-not (Test-Path (Join-Path $ApiDir '.env'))) {
      Copy-Item (Join-Path $ApiDir '.env.example') (Join-Path $ApiDir '.env')
    }
    $env:DATABASE_URL = $DatabaseUrl
    npm run migrate
    npm run seed
  } finally {
    Pop-Location
  }
}

Write-Host 'MADOBIPAY database setup'
Write-Host "Repo: $RepoRoot"
Write-Host "DATABASE_URL=$DatabaseUrl"

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  Write-Host 'Using Docker Compose...'
  Push-Location $RepoRoot
  try {
    docker compose -f $ComposeFile up -d postgres
  } finally {
    Pop-Location
  }
  if (-not (Wait-Postgres 90)) {
    throw 'Postgres did not become ready on port 5432.'
  }
  Invoke-MigrateAndSeed
  Write-Host 'Done. Postgres is running in Docker.'
  exit 0
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  $guess = Get-ChildItem 'C:\Program Files\PostgreSQL' -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    ForEach-Object { Join-Path $_.FullName 'bin\psql.exe' } |
    Where-Object { Test-Path $_ } |
    Select-Object -First 1
  if ($guess) { $psql = @{ Source = $guess } }
}

if ($psql) {
  $psqlExe = if ($psql.Source) { $psql.Source } else { 'psql' }
  Write-Host "Using psql: $psqlExe"
  $superUser = if ($env:PGUSER) { $env:PGUSER } else { 'postgres' }
  if (-not $env:PGPASSWORD) {
    $secure = Read-Host "Password for PostgreSQL user '$superUser'" -AsSecureString
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
      [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
  }
  & $psqlExe -U $superUser -d postgres -v ON_ERROR_STOP=1 -f $BootstrapSql
  if ($LASTEXITCODE -ne 0) { throw "psql bootstrap failed (exit $LASTEXITCODE)" }
  Invoke-MigrateAndSeed
  Write-Host 'Done. Database created with local PostgreSQL.'
  exit 0
}

Write-Host @'
Neither Docker nor psql was found.

Install one of these, then re-run this script:

  winget install Docker.DockerDesktop
  # or
  winget install PostgreSQL.PostgreSQL.16

Then:
  cd C:\Users\elmuj\MADOBIPAY
  powershell -File services\api\scripts\setup-db.ps1
'@
exit 1
