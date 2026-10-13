<#
.SYNOPSIS
    Starts the EduPulse LMS application on http://localhost:5000
#>

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting EduPulse LMS (ASP.NET Core Web API + React)    " -ForegroundColor Cyan
Write-Host "  URL: http://localhost:5000                              " -ForegroundColor Green
Write-Host "  Swagger: http://localhost:5000/swagger                  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location "D:\old pc E\afsal\lms\backend\LMS.API"
dotnet run --urls "http://localhost:5000"
