@echo off
chcp 65001 >nul
echo ===============================================
echo   Working Together Review 시스템
echo   Powered by CINNAMON LAB
echo ===============================================
echo.
echo 서버를 시작합니다...
echo.

REM IP 주소 확인
echo [정보] 현재 컴퓨터의 IP 주소:
ipconfig | findstr /i "IPv4"
echo.

REM Python 버전 확인
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo Python을 먼저 설치해주세요: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [확인] Python 버전:
python --version
echo.

REM 포트 설정
set PORT=8080
echo [설정] 포트: %PORT%
echo.

echo ===============================================
echo   서버가 시작되었습니다!
echo   접속 주소: http://localhost:%PORT%
echo   
echo   사내 다른 PC에서 접속:
echo   http://[위의-IP-주소]:%PORT%
echo   
echo   종료하려면 Ctrl + C를 누르세요
echo ===============================================
echo.

REM Python 웹 서버 실행
python -m http.server %PORT%

pause
