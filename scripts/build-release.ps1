param(
    [switch]$SkipTests,
    [switch]$SkipClean
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$AndroidRoot = Join-Path $ProjectRoot "android"
$LogRoot = Join-Path $ProjectRoot "logs"
$LogFile = Join-Path $LogRoot ("release-build-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))

New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null

function Invoke-Stage {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Command
    )

    Write-Host "==> $Name"
    Add-Content -LiteralPath $LogFile -Value "==> $Name"

    try {
        & $Command 2>&1 | Tee-Object -FilePath $LogFile -Append
        if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
            throw "$Name failed with exit code $LASTEXITCODE"
        }
        Write-Host "Completed: $Name"
    } catch {
        Add-Content -LiteralPath $LogFile -Value "FAILED: $Name - $($_.Exception.Message)"
        throw
    }
}

Push-Location $ProjectRoot
try {
    if (-not $SkipTests) {
        Invoke-Stage "TypeScript check" {
            & npm.cmd exec tsc -- --noEmit
        }
    }

    if (-not $SkipClean) {
        Invoke-Stage "Android safe clean" {
            & powershell.exe -ExecutionPolicy Bypass -File (Join-Path $ProjectRoot "scripts\android-clean.ps1")
        }
    }

    Invoke-Stage "Release APK build" {
        Push-Location $AndroidRoot
        try {
            $env:NODE_ENV = "production"
            & .\gradlew.bat assembleRelease --no-daemon
        } finally {
            Pop-Location
        }
    }

    $apk = Join-Path $AndroidRoot "app\build\outputs\apk\release\app-release.apk"
    if (-not (Test-Path -LiteralPath $apk)) {
        throw "Release APK was not created at $apk"
    }

    Write-Host "APK: $apk"
    Write-Host "Log: $LogFile"
} finally {
    Pop-Location
}
