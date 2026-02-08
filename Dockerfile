# Nginx 기반 정적 웹 서버
FROM nginx:alpine

# 프로젝트 파일 복사
COPY . /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
