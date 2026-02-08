#!/bin/bash

echo "==============================================="
echo "  Working Together Review 시스템"
echo "  Powered by CINNAMON LAB"
echo "==============================================="
echo ""
echo "서버를 시작합니다..."
echo ""

# IP 주소 확인
echo "[정보] 현재 컴퓨터의 IP 주소:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "IP를 찾을 수 없습니다"
else
    # Linux
    hostname -I | awk '{print $1}'
fi
echo ""

# Python 버전 확인
if ! command -v python3 &> /dev/null; then
    echo "[오류] Python3가 설치되어 있지 않습니다."
    echo "Python3를 먼저 설치해주세요"
    exit 1
fi

echo "[확인] Python 버전:"
python3 --version
echo ""

# 포트 설정
PORT=8080
echo "[설정] 포트: $PORT"
echo ""

echo "==============================================="
echo "  서버가 시작되었습니다!"
echo "  접속 주소: http://localhost:$PORT"
echo "  "
echo "  사내 다른 PC에서 접속:"
echo "  http://[위의-IP-주소]:$PORT"
echo "  "
echo "  종료하려면 Ctrl + C를 누르세요"
echo "==============================================="
echo ""

# Python 웹 서버 실행
python3 -m http.server $PORT
