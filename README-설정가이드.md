# 설정 가이드 (한 번만 하면 됨)

## 1. 파일 채우기
`_config.yml` 안에서 `<GITHUB_USERNAME>`으로 되어 있는 부분 2곳을 본인 GitHub 아이디로 바꾸세요.

## 2. 저장소에 올리기
지금 쓰던 저장소(`my-blog`)의 기존 파일(`_config.yml`, `index.md`)을 이 폴더의 파일들로 통째로 교체하고 GitHub에 push 하세요.

## 3. GitHub Pages 배포 방식 변경 (중요)
Chirpy는 GitHub Pages의 기본 테마 목록에 없는 테마라서, 지금까지처럼 "그냥 push하면 자동 빌드"가 안 됩니다.
저장소 Settings → Pages → **Build and deployment → Source를 "GitHub Actions"로 변경**해야 합니다.
이미 넣어드린 `.github/workflows/pages-deploy.yml` 파일이 그 빌드를 대신 처리해줍니다.

## 4. 로컬에서 미리 보기 (선택)
Ruby/Bundler가 설치되어 있다면:
```bash
bundle install
bundle exec jekyll s
```
그 다음 브라우저에서 http://localhost:4000 접속.

## 5. 글 쓰는 법
`_posts/2026-08-28-example-post.md` 파일을 열어보세요. 형식 설명이 주석으로 다 적혀 있습니다.
새 글은 이 파일을 복사해서 파일명과 내용만 바꾸면 됩니다.

## 6. 자기소개 쓰는 법
`_tabs/about.md` 파일을 열어서 주석에 적힌 예시 형식대로 자유롭게 쓰면 됩니다.

---
막히는 부분 있으면 언제든 물어보세요.
