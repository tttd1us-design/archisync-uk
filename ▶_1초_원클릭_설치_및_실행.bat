@echo off
chcp 65001 > nul
title ArchiSync UK - 원클릭 설치 및 실행기
color 0b

echo =========================================================================
echo   🏛️ ArchiSync UK - 글로벌 실시간 음성 통역 시스템
echo   * 1초 원클릭 자동 설치 및 즉시 실행기
echo   * 내 컴퓨터 CPU/RAM/GPU 하드웨어 가속 및 완전 오프라인 지원
echo =========================================================================
echo.

cd /d "%~dp0"

echo [1/3] 내 문서 전용 저장소(ArchiSync_실시간통역) 확인 및 생성 중...
powershell.exe -NoProfile -Command "
$docPath = [System.Environment]::GetFolderPath('MyDocuments')
$targetDir = Join-Path $docPath 'ArchiSync_실시간통역'
if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
Write-Output '  -> 저장 경로: ' $targetDir
"

echo.
echo [2/3] 바탕화면에 바로가기 아이콘 생성 중...
powershell.exe -NoProfile -Command "
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut((Join-Path $DesktopPath 'ArchiSync UK 실시간통역.lnk'))
$Shortcut.TargetPath = (Join-Path $PSScriptRoot '▶_ArchiSync_오프라인_초고속_실행.bat')
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = 'ArchiSync UK 실시간 다국어 음성 통역 시스템'
$Shortcut.Save()
"

echo.
echo [3/3] ArchiSync UK 시스템 실행 중...
start "" "%~dp0▶_ArchiSync_오프라인_초고속_실행.bat"

echo.
echo =========================================================================
echo   🚀 설치 및 실행이 성공적으로 완료되었습니다!
echo   * 바탕화면에 'ArchiSync UK 실시간통역' 바로가기가 생성되었습니다.
echo =========================================================================
echo.
timeout /t 3 > nul
exit
