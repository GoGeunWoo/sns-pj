# T.W(Together Workout)

![T.W(together Workout)](사이트 이미지 넣기)

#### 프로젝트 소개

사용자들이 운동에 관한 일상 및 정보를 공유하며 소통이 가능한 SNS 플랫폼입니다.

#### 프로젝트 진행기간

2024.08 ~ 2024.09 (4주)

#### 프로젝트 배포링크

[ T.W 배포링크 ](https://sns-pj-tw-gogeunwoos-projects.vercel.app/)

##### 테스트 계정

> ID: faker@test.com  
> PW: faker123!!
>
> ID: guma@test.com  
> PW: gumau123!!
> <br/>

## 📋 실행방법

1. 레포지토리 복제 후 의존성 설치

```
$ git clone https://github.com/GoGeunWoo/sns-pj.git
$ cd SNSPJ
$ npm install
```

2. 개발 서버 가동

```
$ npm run dev
```

3. 브라우저에서 실행

```
http://localhost:3000/
```

## 🛠 기술스택

<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white"> <img src="https://img.shields.io/badge/Tailwindcss-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">

<img src="https://img.shields.io/badge/Zustand-1E4CC9?style=for-the-badge&logo=React&logoColor=white"> <img src="https://img.shields.io/badge/React Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white"> <img src="https://img.shields.io/badge/React Hook Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white">

<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white">

<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=netlify&logoColor=white">

<br/>

## 📌 주요기능

##### 토글을 열면 시연영상을 확인하실 수 있습니다

#### <details><summary>로그인 / 회원가입</summary> <br/> <p>로그인</p> <img src="" width="600" /> <br/> <br/> <p>회원가입</p> <img src="" width="600" /> <br/></details>

- 폼 유효성 검증
- 로그인 후 전역상태로 회원정보 관리

#### <details><summary>전체 게시글 피드 조회</summary> <br/> <p>전체상품 - 결과 필터링</p> <img src="" width="600" /> <br/> <br/> <p>전체상품 - 무한스크롤</p> <img src="" width="600" /> <br/></details>

- 모든 게시글 최신순으로 조회
- 무한스크롤을 활용한 페이지네이션(기능 구현 x)

<!-- #### <details><summary>상품 상세 조회</summary><br/> <p>상품 상세정보</p> <img src="https://github.com/wjstjdus96/byhand/assets/77755620/4e13159e-d267-43e9-b28e-f9bad1d0ddb4" width="600" /><br/></details>

- 상품 수량 선택 -> 장바구니 추가 혹은 상품 주문
- 이미지 캐러셀을 통한 다량의 상품 이미지 자동 전환

#### <details><summary>[구매자] 장바구니</summary><br/> <p>장바구니 - 상품선택,수량변경</p> <img src="https://github.com/wjstjdus96/byhand/assets/77755620/ab88a2c2-2a66-4d6b-89e1-00f239aa64b5" width="600" /> <br/> <br/> <p>장바구니 - 부분삭제,부분결제</p> <img src="https://github.com/wjstjdus96/byhand/assets/77755620/7b7b9161-5ca3-4717-be6d-74492e897a8f" width="600" /></details>

- 장바구니 상품 수량 수정 기능

#### <details><summary>[구매자] 선택 상품 주문</summary> <br/> <p>주문-배송정보입력</p> <img src="https://github.com/wjstjdus96/byhand/assets/77755620/4f5b4468-0edc-4aae-8dc1-20e5a2d4b015" width="600" /> <br/> <br/> <p>주문-결제</p> <img src="https://github.com/wjstjdus96/byhand/assets/77755620/50c1c1e2-74ce-4a49-aafa-3ded7825be24" width="600" /></details>

- 카카오 우편번호 api를 활용한 배송 정보 입력 기능

#### <details><summary>[구매자] 주문 내역 조회 및 주문 취소</summary><br/> <p>주문 정보 조회 및 주문 취소</p> <img src="https://github.com/wjstjdus96/byhand/assets/77755620/953a3f66-18f7-4dd8-8aa1-da815ccf1fab" width="600" /></details>

- 날짜별 주문 내역 조회 기능

#### <details><summary>[판매자] 판매상품관리</summary> <br/> <p>판매상품관리 - 상품 등록,수정</p> <img src="https://github.com/wjstjdus96/byhand/assets/77755620/42e80267-58e8-494c-8e95-9d58e6035ad9" width="600" /> <br/> <br/> <p>판매상품관리 - 상품 삭제</p> <img src="https://github.com/wjstjdus96/byhand/assets/77755620/c2b12fdf-3fd1-43a6-89b0-67059eff7fa3" width="600" /></details>

- 판매 상품 조회, 등록, 수정, 삭제 기능
- 등록 시 상품 이미지 개수 5개 제한 -->

<br/>

## 🔫 트러블 슈팅

- [작성중입니다]

<br/>

## 💭 기술적 의사결정

- [작성중입니다.]

<br/>

## 🏗 아키텍쳐

![아키테쳐](아키텍처 작성중입니다)
<br/>

## 🗂 폴더구조

```
┣ 📁public
📦app
 ┣ 📂auth
 ┃ ┣ 📂login
 ┃ ┃ ┗ 📜page.jsx
 ┃ ┗ 📂signup
 ┃ ┃ ┗ 📜page.jsx
 ┣ 📂chat-list
 ┃ ┣ 📜layout.jsx
 ┃ ┗ 📜page.jsx
 ┣ 📂components
 ┃ ┣ 📂chat
 ┃ ┃ ┣ 📜ChatPage.jsx
 ┃ ┃ ┗ 📜ProfilePage.jsx
 ┃ ┣ 📜AuthContext.jsx
 ┃ ┣ 📜CommentAdd.jsx
 ┃ ┣ 📜Icons.jsx
 ┃ ┣ 📜PostAdd.jsx
 ┃ ┣ 📜PostCard.jsx
 ┃ ┣ 📜PostDetail.jsx
 ┃ ┣ 📜PostFeed.jsx
 ┃ ┗ 📜ProfileEditModal.jsx
 ┣ 📂hooks
 ┃ ┣ 📜useComments.jsx
 ┃ ┗ 📜usePostActions.jsx
 ┣ 📂image
 ┃ ┗ 📜user.png
 ┣ 📂main
 ┃ ┣ 📂users
 ┃ ┃ ┗ 📂[userId]
 ┃ ┃ ┃ ┗ 📜page.jsx
 ┃ ┣ 📜layout.jsx
 ┃ ┗ 📜page.jsx
 ┣ 📂profile
 ┃ ┗ 📂edit
 ┃ ┃ ┗ 📜page.jsx
 ┣ 📂utils
 ┃ ┗ 📜firebaseUtils.jsx
 ┣ 📜favicon.ico
 ┣ 📜globals.css
 ┣ 📜layout.jsx
 ┣ 📜page.jsx
 ┣ 📜page.module.css
 ┗ 📜store.js
```

- public : 정적 파일 저장 (svg 파일, SEO 관련 파일 포함)
- app : 소스코드 파일 저장
