# Use only D: for npm cache, temp, and LocalAppData (npm logs default to LocalAppData\npm-cache on Windows).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$cache = Join-Path $PSScriptRoot ".npm-cache"
$tmp = Join-Path $PSScriptRoot ".tmp"
$localApp = Join-Path $PSScriptRoot ".local-appdata"
foreach ($d in @($cache, $tmp, $localApp)) {
  New-Item -ItemType Directory -Force -Path $d | Out-Null
}

# Redirect Windows "local app data" so npm does not touch C:\...\AppData\Local (often full).
$env:LOCALAPPDATA = $localApp
$env:TEMP = $tmp
$env:TMP = $tmp

$cacheFwd = $cache.Replace("\", "/")
$rc = Join-Path $PSScriptRoot ".npm-local.rc"
$rcBody = "cache=$cacheFwd`nloglevel=warn`n"
[System.IO.File]::WriteAllText($rc, $rcBody, [System.Text.UTF8Encoding]::new($false))

$env:npm_config_userconfig = $rc
$env:npm_config_cache = $cache

if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
  npm install --no-audit --no-fund
}
npm run dev
