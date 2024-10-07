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

    if (talkButton) {
        talkButton.addEventListener('click', function () {
            alert('1:1 문의 버튼 클릭됨');
            // 팝업 창 및 GPT 연동 기능은 이후에 구현 예정
        });
    }
});
