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
        window.location.href = "/api/accounts/login-page/";
        return;
    }

    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${access_token}`,
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
        const refreshResponse = await fetch("/api/accounts/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: getRefreshToken() }),
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setAccessToken(data.access);
            options.headers["Authorization"] = `Bearer ${data.access}`;
            response = await fetch(url, options);
        } else {
            removeTokens();
            window.location.href = "/api/accounts/login-page/";
        }
    }

    return response;
}

document.addEventListener("DOMContentLoaded", function () {
    const signupLink = document.querySelector("a[href='/api/accounts/signup-page/']");
    const loginLink = document.querySelector("a[href='/api/accounts/login-page/']");
    const logoutForm = document.querySelector(".logout-form");
    const mypageLink = document.getElementById("mypage-link");
    const chatLink = document.getElementById("chat-link");
    const productRegisterButton = document.getElementById("product-register-button");
    const talkButton = document.getElementById('talk-button');

    function updateButtonDisplay() {
        const accessToken = getAccessToken();

        if (accessToken) {
            // 로그인 상태일 때
            if (signupLink) signupLink.classList.add("d-none");
            if (loginLink) loginLink.classList.add("d-none");
            if (logoutForm) logoutForm.classList.remove("d-none");
            if (mypageLink) mypageLink.classList.remove("d-none");
            if (chatLink) chatLink.classList.remove("d-none");
            if (productRegisterButton) productRegisterButton.classList.remove("d-none");
            if (talkButton) talkButton.classList.remove("d-none");
        } else {
            // 비로그인 상태일 때
            if (signupLink) signupLink.classList.remove("d-none");
            if (loginLink) loginLink.classList.remove("d-none");
            if (logoutForm) logoutForm.classList.add("d-none");
            if (mypageLink) mypageLink.classList.add("d-none");
            if (chatLink) chatLink.classList.add("d-none");
            if (productRegisterButton) productRegisterButton.classList.add("d-none");
            if (talkButton) talkButton.classList.add("d-none");
        }
    }

    // 초기 로딩 시 상태 확인
    updateButtonDisplay();

    // 로그아웃 폼 제출 시 로그아웃 처리
    if (logoutForm) {
        logoutForm.addEventListener("submit", function (event) {
            event.preventDefault();
            removeTokens();
            alert("로그아웃되었습니다.");
            window.location.href = "/api/accounts/login-page/";
            updateButtonDisplay();
        });
    }

    // '내 상점' 클릭 시 로그인 상태가 아닌 경우 로그인 페이지로 이동
    if (mypageLink) {
        mypageLink.addEventListener("click", function (event) {
            const accessToken = getAccessToken();
            const currentUsername = localStorage.getItem("current_username");

            if (!accessToken || !currentUsername) {
                event.preventDefault();
                alert("로그인 후 이용할 수 있습니다.");
                window.location.href = "/api/accounts/login-page/";
            } else {
                mypageLink.href = `/api/accounts/profile-page/${currentUsername}/`;
            }
        });
    }

    // '내 채팅방' 클릭 시 로그인 상태 확인 후 채팅방 목록 페이지로 이동
    if (chatLink) {
        chatLink.addEventListener("click", function (event) {
            event.preventDefault();
            const accessToken = getAccessToken();
            const currentUsername = localStorage.getItem("current_username");

            if (!accessToken || !currentUsername) {
                alert("로그인 후 이용할 수 있습니다.");
                window.location.href = "/api/accounts/login-page/";
                return;
            }

            window.location.href = `/api/products/1on1-chat/${currentUsername}/`;
        });
    }
});