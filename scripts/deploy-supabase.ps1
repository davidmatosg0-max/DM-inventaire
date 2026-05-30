param(
  [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
  [string]$DbPassword = $env:SUPABASE_DB_PASSWORD,
  [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN,
  [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY,
  [string]$MsTenantId = $env:MS_TENANT_ID,
  [string]$MsClientId = $env:MS_CLIENT_ID,
  [string]$MsClientSecret = $env:MS_CLIENT_SECRET,
  [string]$MsSenderUpn = $env:MS_SENDER_UPN,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$supabaseLocalBinary = Join-Path $PSScriptRoot '..\node_modules\.bin\supabase.cmd'
$supabaseCommand = $null

function Invoke-Step {
  param(
    [string]$Description,
    [string]$Command
  )

  Write-Host "`n==> $Description" -ForegroundColor Cyan
  Write-Host $Command -ForegroundColor DarkGray

  if (-not $DryRun) {
    Invoke-Expression $Command
  }
}

function Assert-RequiredValue {
  param(
    [string]$Name,
    [string]$Value
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    throw "La variable $Name es obligatoria. Defínela antes de desplegar."
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (Test-Path $supabaseLocalBinary) {
  $supabaseCommand = "`"$supabaseLocalBinary`""
} elseif (Get-Command supabase -ErrorAction SilentlyContinue) {
  $supabaseCommand = 'supabase'
} elseif ($DryRun) {
  $supabaseCommand = 'supabase'
  Write-Host 'Supabase CLI no está instalado ni localmente ni en PATH. El modo simulación continuará mostrando los comandos previstos.' -ForegroundColor Yellow
} else {
  throw 'Supabase CLI no está instalado ni localmente ni en PATH. Ejecuta npm install o instala Supabase CLI globalmente.'
}

Assert-RequiredValue -Name 'SUPABASE_PROJECT_REF' -Value $ProjectRef
Assert-RequiredValue -Name 'SUPABASE_DB_PASSWORD' -Value $DbPassword
Assert-RequiredValue -Name 'SUPABASE_ACCESS_TOKEN' -Value $AccessToken
Assert-RequiredValue -Name 'SUPABASE_SERVICE_ROLE_KEY' -Value $ServiceRoleKey
Assert-RequiredValue -Name 'MS_TENANT_ID' -Value $MsTenantId
Assert-RequiredValue -Name 'MS_CLIENT_ID' -Value $MsClientId
Assert-RequiredValue -Name 'MS_CLIENT_SECRET' -Value $MsClientSecret
Assert-RequiredValue -Name 'MS_SENDER_UPN' -Value $MsSenderUpn

$env:SUPABASE_ACCESS_TOKEN = $AccessToken
$projectUrl = "https://$ProjectRef.supabase.co"

Write-Host "Repositorio: $repoRoot" -ForegroundColor Green
Write-Host "Proyecto Supabase: $ProjectRef" -ForegroundColor Green

Invoke-Step -Description 'Vincular el proyecto Supabase' -Command "$supabaseCommand link --project-ref $ProjectRef --password `"$DbPassword`""
Invoke-Step -Description 'Aplicar migraciones de base de datos' -Command "$supabaseCommand db push"
Invoke-Step -Description 'Configurar secretos de la Edge Function' -Command "$supabaseCommand secrets set SUPABASE_URL=`"$projectUrl`" SUPABASE_SERVICE_ROLE_KEY=`"$ServiceRoleKey`""
Invoke-Step -Description 'Configurar secretos de Microsoft Graph' -Command "$supabaseCommand secrets set MS_TENANT_ID=`"$MsTenantId`" MS_CLIENT_ID=`"$MsClientId`" MS_CLIENT_SECRET=`"$MsClientSecret`" MS_SENDER_UPN=`"$MsSenderUpn`""
Invoke-Step -Description 'Desplegar la Edge Function admin-users' -Command "$supabaseCommand functions deploy admin-users"
Invoke-Step -Description 'Desplegar la Edge Function reports-prs' -Command "$supabaseCommand functions deploy reports-prs"
Invoke-Step -Description 'Desplegar la Edge Function send-graph-mail' -Command "$supabaseCommand functions deploy send-graph-mail"

if ($DryRun) {
  Write-Host "`nModo simulación completado. No se ejecutó ningún despliegue real." -ForegroundColor Yellow
} else {
  Write-Host "`nDespliegue Supabase completado." -ForegroundColor Green
  Write-Host 'Recuerda configurar también VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y VITE_ENABLE_SUPABASE_AUTH en el hosting del frontend.' -ForegroundColor Yellow
}