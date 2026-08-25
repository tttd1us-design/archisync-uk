@echo off
chcp 65001 > nul
title ArchiSync UK - GitHub 원클릭 동기화
color 0b

echo ================================================================
echo   ArchiSync UK 실시간 통역 시스템 - GitHub 원클릭 동기화
echo   원격 저장소: https://github.com/tttd1us-design/archisync-uk.git
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/3] 로컬 변경 사항 확인 중...
git status -s

echo.
echo [2/3] 변경 사항 추가 및 커밋 생성 중...
git add -A
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
git commit -m "Auto-sync update: %TIMESTAMP%"

echo.
echo [3/3] GitHub 원격 저장소로 Push(동기화) 진행 중...
git push origin main

echo.
echo ================================================================
echo   GitHub 원격 동기화가 성공적으로 완료되었습니다!
echo   저장소 확인: https://github.com/tttd1us-design/archisync-uk
echo ================================================================
echo.
pause
