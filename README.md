# 🍓StrawBerryMarket
<a href="https://sbmarket.kro.kr/" target="_blank">
    <img width="300" src="https://sbmarket.kro.kr/static/images/banner.png" alt="sbmarket" title="딸기마캣">
</a>

[![ex_screenshot]()](https://sbmarket.kro.kr/)
 

<br/>

## 📝프로젝트 소개
<details>
    <summary>
당근마켓을 오마주 한 중고마캣 플랫폼 딸기마켓 <br>
    </summary>
    <div markdown="1">
    </div>
    
### **기획 의도** </br>
 중고거래를 핵심으로 하는 웹 앱  및 API
 
</details>
    
### 🔧**프로젝트 핵심 기술**
    
> **AI** </br>
 기술을 기반한 상품추천 및 다양한 커뮤니티 기술을 첨가한 이커머스
<br/>

### 🗓️개발 기간
- 24.09.23 ~ 24.10.24
<br/>

### 🎞️서비스 시연 영상
[![시연영상]]()
<br/>


## 🧑‍💻팀 멤버 구성
| naem columms | tag columns | profile columns |
| :----------: | :---------- | :-------------- |
| 임선오 | [@Limsunoh] | (https://github.com/Limsunoh) |
| 이광열 | [@kwang1215] | (https://github.com/kwang1215) |
| 류홍규 | [@YesYesMe0321] | (https://github.com/YesYesMe0321) |
| 이상현 | [@sanghyun-Lee2002] | (https://github.com/sanghyun-Lee2002) |

<br/>

# 🏗️ 서비스 아키텍처
![ex_screenshot]()

<br/>

# ⚙️사용 환경 설정
1. **가상환경 생성&실행**
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
<br>
    
2. **pip 설치**
    - 패키지를 처음 설치하는 경우 
        ```bash 
        pip install -r requirements.txt
        ```
    - 패키지가 설치되어 있는 경우 
        ```bash
        pip install --force-reinstall -r requirements.txt
        ```
<br>

3. **.env 세팅**
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
    ```
<br>
<br/>

# 🖥️개발 환경
<details>
<summary>프론트엔드</summary>
<div>

- React: 프론트엔드 라이브러리 <br/>
- Zustand: 상태 관리 라이브러리 <br/>
- Cloudflare: CDN 및 보안 서비스

</div>
</details>

<details>

<div>

- Django: 백엔드 프레임워크 <br/>
- Gunicorn: WSGI HTTP 서버 <br/>
- MySQL: 데이터베이스 관리 시스템 <br/>
- Nginx: HTTP 및 리버스 프록시 서버

</div>
</details>

<details>
<summary>클라우드 인프라</summary>
<div>

- Amazon EC2: 서버 호스팅 <br/>
- 내도메인.한국 : DNS 및 도메인 이름 관리 서비스 <br/>

</div>
</details>

<details>
<summary>추가 서비스</summary>
<div>

- GitHub: 소스 코드 관리 및 협업 도구 <br/>
- GPT AI: 챗봇 서비스 <br/>

</div>
</details>


# 🛠️ ERD
![image]()

<br/>

# ✅주요 기능


<br/>


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
