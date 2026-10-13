<#
.SYNOPSIS
    Automated IIS Deployment Script for EduPulse LMS
.DESCRIPTION
    Builds the React frontend, publishes the ASP.NET Core Web API,
    creates the IIS Application Pool and Website on port 8080 (or custom port).
    Run this script in an Administrative PowerShell window.
#>

param(
    [string]$SiteName = "EduPulseLMS",
    [int]$Port = 8080,
    [string]$PublishPath = "D:\old pc E\afsal\lms\publish"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  EduPulse LMS - Automated IIS Deployment Script          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "`n[1/5] Building React Frontend..." -ForegroundColor Yellow
Set-Location "D:\old pc E\afsal\lms\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed. Aborting deployment."
    exit 1
}

# 2. Publish ASP.NET Core Web API
Write-Host "`n[2/5] Publishing ASP.NET Core Web API to $PublishPath..." -ForegroundColor Yellow
Set-Location "D:\old pc E\afsal\lms\backend\LMS.API"
dotnet publish -c Release -o $PublishPath
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend publish failed. Aborting deployment."
    exit 1
}

# 3. Import IIS Module
Write-Host "`n[3/5] Configuring IIS..." -ForegroundColor Yellow
Import-Module WebAdministration -ErrorAction SilentlyContinue
if (-not (Get-Module WebAdministration)) {
    Write-Warning "WebAdministration module not found. Please ensure IIS Management Tools are installed."
    Write-Host "You can still run the application natively using: .\run-localhost.ps1" -ForegroundColor Green
    exit 0
}

# 4. Create App Pool (No Managed Code for ASP.NET Core)
$appPoolName = "${SiteName}Pool"
if (-not (Test-Path "IIS:\AppPools\$appPoolName")) {
    Write-Host "Creating IIS Application Pool: $appPoolName" -ForegroundColor Cyan
    New-Item "IIS:\AppPools\$appPoolName" | Out-Null
}
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name "enable32BitAppOnWin64" -Value $false

# 5. Create or Update IIS Web Site
if (Test-Path "IIS:\Sites\$SiteName") {
    Write-Host "Updating existing site $SiteName..." -ForegroundColor Cyan
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name "physicalPath" -Value $PublishPath
} else {
    Write-Host "Creating IIS Website: $SiteName on port $Port..." -ForegroundColor Cyan
    New-Item "IIS:\Sites\$SiteName" -bindings @{protocol="http";bindingInformation="*:${Port}:"} -physicalPath $PublishPath | Out-Null
}

Set-ItemProperty "IIS:\Sites\$SiteName" -Name "applicationPool" -Value $appPoolName

# Set NTFS Permissions for IIS
Write-Host "`n[4/5] Granting IIS permissions..." -ForegroundColor Yellow
$acl = Get-Acl $PublishPath
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.AddAccessRule($rule)
Set-Acl $PublishPath $acl

# 6. Start Site
Write-Host "`n[5/5] Starting Website..." -ForegroundColor Yellow
Start-WebSite -Name $SiteName -ErrorAction SilentlyContinue

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  Deployment Succeeded!                                   " -ForegroundColor Green
Write-Host "  URL: http://localhost:$Port                             " -ForegroundColor Green
Write-Host "  API / Swagger: http://localhost:$Port/swagger           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
