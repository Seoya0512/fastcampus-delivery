# 어떤 이미지를 사용할지 정의 
FROM node:alpine AS development 

WORKDIR /user/src/app

# package.json 복사해오기 
COPY package*.json ./

# pnpm-lock.ymal
COPY pnpm-lock.yaml ./

# pnpm 설치하기
RUN npm i -g pnpm 

# Dependency 설치하기
RUN pnpm i

# 나머지 파일/폴더 복사해오기
COPY . .

# 커맨드 실행 
CMD ["pnpm", "start:dev", "notification"]