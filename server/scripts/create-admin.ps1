[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[^\s@]+@[^\s@]+\.[^\s@]{2,}$')]
  [string]$Email,

  [Parameter(Mandatory = $true)]
  [ValidateLength(2, 80)]
  [string]$Name,

  [ValidateSet('owner', 'staff')]
  [string]$Role = 'owner'
)

$ErrorActionPreference = 'Stop'
$securePassword = Read-Host 'Enter admin password (12-72 characters)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$exitCode = 1

try {
  $env:ADMIN_EMAIL = $Email.Trim().ToLowerInvariant()
  $env:ADMIN_NAME = $Name.Trim()
  $env:ADMIN_ROLE = $Role
  $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

  Push-Location (Join-Path $PSScriptRoot '..')
  try {
    npm run admin:create
    $exitCode = $LASTEXITCODE
  }
  finally {
    Pop-Location
  }
}
finally {
  Remove-Item Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:ADMIN_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:ADMIN_ROLE -ErrorAction SilentlyContinue
  Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
  if ($bstr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
  $securePassword.Dispose()
}

if ($exitCode -ne 0) {
  throw "Admin account creation failed (npm exit code $exitCode). Check the server output and MongoDB connection."
}
