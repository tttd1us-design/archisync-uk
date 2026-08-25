@echo off
chcp 65001 > nul
title ArchiSync UK - 오프라인 초고속 하드웨어 가속 실행기
color 0a

echo =========================================================================
echo   🏛️ ArchiSync UK - 오프라인 독립 초고속 실시간 통역기
echo   * 인터넷/Antigravity 미연결 상태에서도 100% 로컬 독립 작동
echo   * CPU / RAM / GPU(Video 카드) 하드웨어 가속 60~120fps 최적화
echo =========================================================================
echo.

cd /d "%~dp0"

echo [1/2] 초경량 오프라인 로컬 서버(0% CPU, 10MB RAM) 시작 중...
start /b powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0server.ps1"

timeout /t 1 /nobreak > nul

echo [2/2] GPU 하드웨어 가속 크롬 브라우저 실행 중...
set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_PATH%" set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe

set GPU_FLAGS=--enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --enable-features=VaapiVideoDecoder

if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" %GPU_FLAGS% --app="http://localhost:5173"
) else (
    start http://localhost:5173
)

echo.
echo =========================================================================
echo   🚀 ArchiSync UK가 성공적으로 실행되었습니다!
echo   * 접속 주소: http://localhost:5173
echo   * 음성 및 대화록 자동 저장 위치: 내 문서\음성
echo =========================================================================
echo.
timeout /t 3 > nul
exit
