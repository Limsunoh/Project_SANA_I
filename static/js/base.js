// 인증 관련 함수
function getAccessToken() {
    return localStorage.getItem("access_token");
}

function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

function setAccessToken(token) {
    localStorage.setItem("access_token", token);
}

function setRefreshToken(token) {
    localStorage.setItem("refreshToken", token);
}

function removeTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
}

// 인증이 필요한 fetch 함수
async function fetchWithAuth(url, options = {}) {
    const access_token = getAccessToken();

    if (!access_token) {
        window.location.href = "/api/accounts/login-page/"; // 토큰이 없으면 로그인 페이지로 이동
        return;
    }

    // 기존 헤더에 Authorization 헤더 추가
    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${access_token}`,
    };

    let response = await fetch(url, options);

    // 토큰이 만료되었을 때 refresh token을 사용하여 갱신
    if (response.status === 401) {
        const refreshResponse = await fetch("/api/accounts/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: getRefreshToken() }),
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setAccessToken(data.access);

            // 갱신된 토큰으로 다시 요청
            options.headers["Authorization"] = `Bearer ${data.access}`;
            response = await fetch(url, options);
        } else {
            removeTokens();
            window.location.href = "/api/accounts/login-page/";
        }
    }

    return response;
}

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const productRegisterButton = document.getElementById('product-register-button');

    // 검색 기능 구현
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function () {
            const query = searchInput.value.trim();
            if (query) {
                // 검색어가 있을 때만 URL을 변경하고 `history.pushState`로 브라우저 URL을 업데이트
                const newUrl = `/api/products/home-page/?search=${query}`;
                window.history.pushState({ path: newUrl }, '', newUrl);
                
                // `loadProductList` 함수를 직접 호출하여 검색 결과를 표시 (home.js에서 함수가 전역으로 노출되어 있어야 함)
                if (typeof loadProductList === 'function') {
                    loadProductList('created_at', query);  // 기본 정렬 기준을 유지하면서 검색
                }
            }
        });

        // 엔터 키로도 검색 가능하게 설정
        searchInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    const newUrl = `/home-page/?search=${query}`;
                    window.history.pushState({ path: newUrl }, '', newUrl);

                    if (typeof loadProductList === 'function') {
                        loadProductList('created_at', query);
                    }
                }
            }
        });
    }

    // 상품 등록 버튼 클릭 이벤트
    if (productRegisterButton) {
        productRegisterButton.addEventListener('click', function () {
            window.location.href = "/api/products/create/"; // 상품 등록 페이지로 이동
        });
    }

    // 톡(Talk) 버튼 관련 이벤트 추가
    const talkButton = document.getElementById('talk-button');
    const chatPopup = document.getElementById('chat-popup');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatBody = document.getElementById('chat-body');
    let isPopupOpen = false;

    // 기본 인사 메시지
    const defaultMessage = '안녕하세요! 딸기마켓에 대해 궁금한 점이 있으시면 말씀해 주세요.\n중고 물품 거래와 관련된 정보나 이용약관에 대한 질문에 답변해 드리겠습니다.\n어떤 도움이 필요하신가요?';

    if (talkButton) {
        talkButton.addEventListener('click', function () {
            if (isPopupOpen) {
                // 팝업이 열려 있으면 닫기
                chatPopup.style.display = 'none';
                isPopupOpen = false;
                talkButton.classList.remove('chat-active');  // 버튼 호버 활성화
            } else {
                // 팝업이 닫혀 있으면 열기
                chatPopup.style.display = 'flex';
                isPopupOpen = true;
                talkButton.classList.add('chat-active');  // 버튼 호버 비활성화

                // 기본 메시지가 이미 있는지 확인하고 추가
                if (!chatBody.innerText.includes(defaultMessage)) {
                    addMessageToChat('AI', defaultMessage);  // 기본 메시지 추가
                }
            }
        });
    }

    // Send 버튼 클릭 시 메시지 보내기 기능
    if (sendButton) {
        sendButton.addEventListener('click', function () {
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                addMessageToChat('User', userMessage);
                chatInput.value = '';  // 입력 필드 초기화

                // AI에게 질문 보내기 (API 경로 및 필드명 변경에 맞춰 수정)
                sendMessageToAI(userMessage);
            }
        });
    }

    // AI에게 메시지 전송하는 함수
    async function sendMessageToAI(message) {
        try {
            const response = await fetch('/api/manager/aiask/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message }),
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage = data.response;
                addMessageToChat('AI', aiMessage);
            } else {
                console.error('AI 응답 실패:', response.statusText);
            }
        } catch (error) {
            console.error('AI 요청 에러:', error);
        }
    }

    // 채팅 창에 메시지 추가하는 함수
    function addMessageToChat(sender, message) {
        const messageContainer = document.createElement('div');
        
        // 메시지에서 줄바꿈을 <br>로 변환하여 적용
        const formattedMessage = message.replace(/\n/g, '<br>');

        // 메시지 타입에 따라 다른 스타일 적용
        if (sender === 'User') {
            messageContainer.classList.add('user-container');
            messageContainer.innerHTML = `<div class="user-message">${formattedMessage}</div>`;
        } else {
            messageContainer.classList.add('ai-container');
            messageContainer.innerHTML = `<div class="ai-message">${formattedMessage}</div>`;
        }

        chatBody.appendChild(messageContainer);

        // 채팅 내용이 많아지면 자동으로 스크롤 하단으로 이동
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // 엔터키로 메시지 전송 가능
    chatInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });
});
