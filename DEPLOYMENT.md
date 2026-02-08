# 사내 네트워크 배포 가이드

## 📋 배포 전 준비사항

### 1. 파일 확인
- [ ] index.html
- [ ] css/ 폴더 (fix.css, style.css, powered-by.css)
- [ ] js/ 폴더 (모든 .js 파일)
- [ ] README.md

### 2. 서버 준비
- [ ] 서버 또는 PC 준비 (24시간 켜둘 수 있는 환경)
- [ ] 고정 IP 또는 컴퓨터 이름 확인
- [ ] 방화벽 포트 열기 (8080 또는 사용할 포트)

### 3. 네트워크 설정
- [ ] 방화벽 인바운드 규칙 추가
- [ ] 사내 DNS 등록 (선택사항)
- [ ] HTTPS 설정 (선택사항, 민감정보 있으면 권장)

## 🚀 추천 배포 방법

### 시나리오 1: 빠르게 테스트하고 싶을 때
→ **Python 웹 서버** 사용
```bash
python -m http.server 8080
```

### 시나리오 2: 장기 운영 예정
→ **Docker** 또는 **IIS/Apache** 사용

### 시나리오 3: 서버 없이 간단하게
→ **Vercel/Netlify** 같은 무료 호스팅 (외부 접근 필요 시)

## 📱 접속 방법

### PC에서 접속
1. 웹 브라우저 열기
2. `http://[서버-IP]:8080` 입력
3. 예: `http://192.168.1.100:8080`

### 사내 도메인 사용 (IT팀 협조 필요)
1. IT팀에 요청: evaluation.company.local → 서버 IP
2. 접속: `http://evaluation.company.local:8080`

## 🔒 보안 고려사항

### 1. 데이터 보호
- ✅ 모든 데이터는 사용자 브라우저 LocalStorage에 저장
- ✅ 서버에 데이터 저장 안 됨
- ⚠️ 사용자가 브라우저 캐시를 지우면 데이터 손실

### 2. 백업 방법
```javascript
// 브라우저 콘솔에서 실행
// 모든 데이터 내보내기
const backup = {};
for (let key in localStorage) {
    if (key.startsWith('evaluation_')) {
        backup[key] = localStorage[key];
    }
}
console.log(JSON.stringify(backup));
// 결과를 복사해서 텍스트 파일로 저장
```

### 3. HTTPS 설정 (선택)
민감한 정보 포함 시 HTTPS 권장:
- Let's Encrypt (무료 SSL 인증서)
- 사내 인증서 발급

## 🔥 문제 해결

### 접속이 안 될 때
1. 서버가 실행 중인지 확인
2. 방화벽 설정 확인
3. IP 주소 재확인
4. 다른 PC에서 ping 테스트

### 데이터가 저장 안 될 때
1. 브라우저 쿠키/LocalStorage 허용 확인
2. 시크릿 모드 아닌지 확인
3. 브라우저 업데이트

### 여러 명이 동시 사용 시
- ✅ 각자 독립적으로 사용 가능
- ✅ 데이터는 각 PC의 브라우저에 저장
- ⚠️ 서로 다른 PC에서 동일 계정 사용 시 데이터 불일치 가능

## 📞 지원

- 기술 문제: IT 부서 문의
- 기능 문의: 개발자 문의
- 긴급 상황: [담당자 연락처]

---
**작성일**: 2026-02-08
**작성자**: CINNAMON LAB
