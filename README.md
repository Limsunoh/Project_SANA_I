# 🍓StrawBerryMarket
<a href="https://sbmarket.kro.kr/" target="_blank">
    <img 
    width="1000" 
    src="https://sbmarket.kro.kr/static/images/banner.png" 
    alt="sbmarket" 
    title="딸기마캣 접속하기"
    style="display: block; margin: auto;">
</a>

</br>


## 📖목차
1. [프로젝트 소개]
2. [기획 의도](#기획-의도)
3. [팀소개]
4. [프로젝트 핵심 기술 & 기능]()
5. [프로젝트 기능]
6. [개발기간]
7. [서비스 구조]()
8. [와이어프레임]
9. [API명세서]
10. [ERD]
11. [트러블 슈팅] 
12. [사용 환경 설정]

<!--여기에 목차 -->



</br>

## 📝프로젝트 소개

### 기획 의도 </br>
- 중고거래를 핵심으로 하는 웹 앱 및 API
- 당근마켓을 오마주 한 중고마캣 플랫폼, 딸기마켓

</br>


### 🎞️서비스 시연 영상
<div style="text-align: center;">
  <video width="560" height="315" controls>
    <source src="static/videos/시연영상_B07팀(딸기마켓).mp4" type="video/mp4">
    static/videos/시연영상_B07팀(딸기마켓).mp4
  </video>
</div>

</br>


## 🧑‍💻팀원 구성
| Role | Name | Profile | Part |
| :---: | :---: | :--- | :-- |
| 리더 | 임선오 | [@Limsunoh](https://github.com/Limsunoh) |  |
| 부리더 | 이광열 | [@kwang1215](https://github.com/kwang1215) |  |
| 서기 | 류홍규 | [@YesYesMe0321](https://github.com/YesYesMe0321) |  |
| 서기 | 이상현 | [@sanghyun-Lee2002](https://github.com/sanghyun-Lee2002) |  |

</br>


## 🔧프로젝트 핵심 기술 & 기능

> **🤖 AI** </br>
 기술을 기반한 상품추천 및 다양한 커뮤니티 기술을 첨가한 이커머스

</br>

> **💬 채팅** </br>
 구매자와 판매자 간의 `long-polling`방식의 1:1채팅 기능
 
</br>

> **⭐️리뷰** </br>
 `MultiSelectField`를 활용한 선택형 __리뷰__ 및 __점수 관리__

 </br>


<details> 
<summary style="font-weight:bold; font-size:150%;"> 
🔧프로젝트 기능
</summary>
<div markdown="1"></div>

### 👤유저와 연관 된 게시물, 리뷰 등등의 기능 집합 서비스, 내 상점(프로필)
 > - 구매자들이 작성 한 리뷰들로 `점수`를 수집하며, <br>페이지에서 표기되는 점수를 클릭하여 받은 `리뷰`들을 볼 수 있습니다.
 > - 
 > - 
 > - 

   <details> 
      <summary style="color: gray; font-size:75%;">
      🔍︎서비스 이미지 보기
      </summary>
      <img scr=>
   </details>

### 💬long-poling방식을 이용한 실시간 채팅
 > - 
 > - 
 > - 

   <details> 
      <summary style="color: gray; font-size:75%;">
      🔍︎서비스 이미지 보기
      </summary>

   </details> 
   
### 🤖정확한 검색어가 아닌 편한 문장이나 단어로 검색 할 수 있는 AI상품 추천
 > - 
 > - 
 > - 

   <details> 
      <summary style="color: gray; font-size:75%;">
      🔍︎서비스 이미지 보기
      </summary>

   </details> 

### 
 > - 
 > - 
 > - 

   <details> 
      <summary style="color: gray; font-size:75%;">
      🔍︎서비스 이미지 보기
      </summary>

   </details>

### 
 > - 
 > - 
 > - 

   <details> 
      <summary style="color: gray; font-size:75%;">
      🔍︎서비스 이미지 보기
      </summary>

   </details>
</details> </br>


## 🗓️개발 기간
- 2024.09.23(mon) ~ 2024.10.24(fri)

</br>


## 🕸️Wireframe

<a href="" target="_blank">
   <img 
   width="1000" 
   src="" 
   alt="sbmarket_ERD" 
   title="ERD" 
   style="display: block; margin: auto;"> 
   </img>
</a>

</br>


## API명세서
<!-- API 명세서 참조 할 것.-->

</br>


## 🔌ERD Diagram

<a href="static/images/README/sbmarket_ERD.png" target="_blank">
   <img 
   width="1000" 
   src="static/images/README/sbmarket_ERD.png" 
   alt="sbmarket_ERD" 
   title="ERD" 
   style="display: block; margin: auto;"> 
   </img>
</a>

</br>


## 🚨트러블슈팅


</br>


# ⚙️사용 환경 설정

### Development Environment
`annotated-types==0.7.0`
`anyio==4.6.0`
`asgiref==3.8.1`
`black==24.8.0`
`certifi==2024.8.30`
`cffi==1.17.1`
`click==8.1.7`
`colorama==0.4.6`
`cryptography==43.0.1`
`distro==1.9.0`
`Django==4.2`
`django-filter==24.3`
`django-multiselectfield==0.1.13`
`django-seed==0.3.1`
`djangorestframework==3.15.2`
`djangorestframework-simplejwt==5.3.1`
`exceptiongroup==1.2.2`
`Faker==29.0.0`
`h11==0.14.0`
`httpcore==1.0.5`
`httpx==0.27.2`
`idna==3.10`
`jiter==0.5.0`
`mypy-extensions==1.0.0`
`mysqlclient==2.2.4`
`openai==1.50.2`
`packaging==24.1`
`pathspec==0.12.1`
`pillow==10.4.0`
`platformdirs==4.3.6`
`pycparser==2.22`
`pydantic==2.9.2`
`pydantic_core==2.23.4`
`PyJWT==2.9.0`
`python-dateutil==2.9.0.post0`
`sentry-sdk==2.17.0`
`six==1.16.0`
`sniffio==1.3.1`
`sqlparse==0.5.1`
`tomli==2.0.1`
`toposort==1.10`
`tqdm==4.66.5`
`typing_extensions==4.12.2`
`tzdata==2024.2`
`urllib3==2.2.3`

</br>


### 1️⃣가상환경 생성&실행
    - Windows
        ```bash
        python -m venv venv
        source venv/Scripts/activate
        ```
    - Mac
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

### 2️⃣패키지 설치
    - 패키지를 처음 설치하는 경우 
        ```bash 
        pip install -r requirements.txt
        ```
    - 패키지가 설치되어 있는 경우 
        ```bash
        pip install --force-reinstall -r requirements.txt
        ```

### 3️⃣슈퍼유저 생성 (관리자 계정)
   ```bash
   python manage.py createsuperuser
   ```

### 4️⃣.env Setting
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
    ```
</br>


# 🖥️Technologies & Tools

### 📝FrontEnd
![HTML5](https://img.shields.io/badge/html-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white">
<img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white"/>
<img src="https://img.shields.io/badge/AJAX-007FFF?style=for-the-badge&logo=javascript&logoColor=white">
<img src="https://img.shields.io/badge/Fetch_API-4285F4?style=for-the-badge&logo=javascript&logoColor=white">

<!-- <img src="https://img.shields.io/badge/Wireframe-lightgrey?style=for-the-badge&logo=wire&logoColor=white"> -->


### 📝BackEnd
<img src="https://img.shields.io/badge/python 3.10-3776AB?style=for-the-badge&logo=python&logoColor=white"> 
<img src="https://img.shields.io/badge/django 4.2-092E20?style=for-the-badge&logo=django&logoColor=white"> 
<img src="https://img.shields.io/badge/django rest framework 3.15.2-092E20?style=for-the-badge&logo=django&logoColor=white"> 


### 📝Server
<img src="https://img.shields.io/badge/AMAZON EC2-FFE900?style=for-the-badge&logo=amazon&logoColor=black"> 
<img src="https://img.shields.io/badge/GUNICORN-2BB530?style=for-the-badge&logo=gunicorn&logoColor=white"> 
<img src="https://img.shields.io/badge/NGINX-2F9624?style=for-the-badge&logo=nginx&logoColor=white">  
<a href="https://xn--220b31d95hq8o.xn--3e0b707e/" target="_blank">
  <img src="https://img.shields.io/badge/내도메인.한국-003366?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI1NiAyNTYiPjxnIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTEyOCwwIEM1Ny42NzQsMCwwLDU3LjY3NCwwLDEyOEMwLDE5OC4zMjYsNTcuNjc0LDI1NiwxMjgsMjU2YzcwLjMyNiwwLDEyOC01Ny42NzQsMTI4LTEyOEMyNTYsNTcuNjc0LDE5OC4zMjYsMCwxMjgsMCIgZmlsbD0iI0ZGMDAwMCIvPjxwYXRoIGQ9Ik0xMjgsMjU2YzcwLjMyNiwwLDEyOC01Ny42NzQsMTI4LTEyOGMwLTcwLjMyNi01Ny42NzQtMTI4LTEyOC0xMjhWMTI4IEMwLDE5OC4zMjYsNTcuNjc0LDI1NiwxMjgsMjU2eiIgZmlsbD0iIzAwMjQ2NiIvPjwvZz48L3N2Zz4=" alt="내도메인.한국" logoWidth="30">
</a>
<img src="https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white"/>
<img src="https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=Ubuntu&logoColor=white"/>


### 📝DataBase
</summary>
<div markdown="1"></div>

<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">


### 📝Management
<img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"> 
<img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white"> 
<!--
<img src="https://img.shields.io/badge/github action-3399FF?style=for-the-badge&logo=github&logoColor=white"> 
-->


### 💬Communication
<img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=Notion&logoColor=white"/>
<img src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white"/>

</br>


<!-- 
<details>
<summary><h2>🌟 git commit 규칙</h2></summary>
<div markdown="1">
- feat : 새로운 기능에 대한 커밋
- fix : 일반적인 수정
- bugfix : 버그 내용에 대한 수정
- refactor : 코드 스타일 및 리팩도링에 대한 커밋
- rename : 파일 명 혹은 폴더명 수정 작업
- remove : 파일의 삭제 작업을 수행하는 경우
</div>
</details>
-->

<!-- 4. 이 프로젝틀를 하며 어떤 트러블이 있었고 트러블 슈팅은 어떻게 진행했는가 -->


◻ ©2024 SANA_I Final Project : B07 teams