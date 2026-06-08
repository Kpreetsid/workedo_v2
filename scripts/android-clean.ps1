$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ProjectRootResolved = (Resolve-Path -LiteralPath $ProjectRoot).Path

function Test-IsUnderRoot {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Root
    )

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $fullRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd('\')

    return $fullPath.Equals($fullRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
        $fullPath.StartsWith("$fullRoot\", [System.StringComparison]::OrdinalIgnoreCase)
}

function Remove-SafeDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string[]]$AllowedRoots,
        [switch]$ContinueOnError
    )

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $isAllowed = $false

    foreach ($root in $AllowedRoots) {
        if (Test-IsUnderRoot -Path $fullPath -Root $root) {
            $isAllowed = $true
            break
        }
    }

    if (-not $isAllowed) {
        throw "Refusing to delete outside allowed roots: $fullPath"
    }

    if (Test-Path -LiteralPath $fullPath) {
        Write-Host "Removing $fullPath"
        for ($attempt = 1; $attempt -le 3; $attempt++) {
            try {
                Remove-Item -LiteralPath $fullPath -Recurse -Force
                break
            } catch {
                if ($attempt -eq 3) {
                    if ($ContinueOnError) {
                        Write-Warning "Could not fully remove $fullPath`: $($_.Exception.Message)"
                    } else {
                        throw
                    }
                } else {
                    Start-Sleep -Seconds 2
                }
            }
        }
    } else {
        Write-Host "Skipping missing $fullPath"
    }
}

Write-Host "Stopping Gradle daemons..."
Push-Location $ProjectRootResolved
try {
    if (Test-Path -LiteralPath ".\android\gradlew.bat") {
        & .\android\gradlew.bat --stop
    }
} catch {
    Write-Warning "Gradle daemon stop failed: $($_.Exception.Message)"
} finally {
    Pop-Location
}

Remove-SafeDirectory -Path "$ProjectRootResolved\android\.gradle" -AllowedRoots @($ProjectRootResolved) -ContinueOnError
Remove-SafeDirectory -Path "$ProjectRootResolved\android\build" -AllowedRoots @($ProjectRootResolved)
Remove-SafeDirectory -Path "$ProjectRootResolved\android\app\build" -AllowedRoots @($ProjectRootResolved)
Remove-SafeDirectory -Path "$ProjectRootResolved\android\app\.cxx" -AllowedRoots @($ProjectRootResolved)

$driveRoot = [System.IO.Path]::GetPathRoot($ProjectRootResolved)
$cxxRoot = Join-Path $driveRoot "_cxx"
$workedoCxx = Join-Path $cxxRoot "workedo"
Remove-SafeDirectory -Path $workedoCxx -AllowedRoots @($cxxRoot)

Write-Host "Android clean completed."
