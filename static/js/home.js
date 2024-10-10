let currentPage = 1; // 현재 페이지 번호
let totalPages = 1;  // 전체 페이지 수 (초기값)
let isAIRecommendationActive = false;  // AI 추천 목록 활성화 상태
let isSearchActive = false;  // 검색 활성화 상태
let aiRecommendedProducts = [];  // AI 추천 목록을 저장할 변수

// URL을 통해 AI 추천 여부를 체크하고 설정하는 함수
function checkAIRecommendationStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('ai_search')) {
        isAIRecommendationActive = false;
        document.getElementById('ai-recommendation-message').style.display = 'none'; // AI 문구 숨기기
    }
}

// 상품 목록을 가져오는 함수
async function loadProductList(order_by = '', search = '', page = 1) {
    checkAIRecommendationStatus(); // AI 상태 체크
    const productListContainer = document.getElementById('product-list-grid');
    showLoading(); // 로딩창 표시

    try {
        let apiUrl = `/api/products?search=${search}&order_by=${order_by}&page=${page}`;
        console.log(`API 호출 URL: ${apiUrl}`);  // URL 로그 출력

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('상품 목록을 불러오는데 실패했습니다.');
        }

        const products = await response.json();
        productListContainer.innerHTML = '';

        const productList = products.results;
        productList.forEach(product => {
            const productCard = `
                <div class="product-item" onclick="window.location.href='/api/products/detail-page/${product.id}/'" style="cursor: pointer;">
                    <div class="product-image">
                        <img src="${product.preview_image}" alt="${product.title}">
                    </div>
                    <div class="product-info">
                        <h3>${product.title}</h3>
                        <p>판매자: ${product.author}</p>
                        <p class="product-price">${product.price}원</p>
                        <p>찜수: ${product.likes_count}</p>
                        <p>조회수: ${product.hits}</p>
                    </div>
                </div>
            `;
            productListContainer.insertAdjacentHTML('beforeend', productCard);
        });

        currentPage = page;
        totalPages = Math.ceil(products.count / 12); // 한 페이지에 12개의 상품이 보이도록 설정
        updatePaginationControls(search, order_by);
    } catch (error) {
        console.error('에러 발생:', error); // 에러 로그 확인
        alert('상품 목록을 불러올 수 없습니다.');
    } finally {
        hideLoading(); // 로딩창 숨김
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';
    const orderByParam = urlParams.get('order_by') || 'created_at';
    currentPage = parseInt(urlParams.get('page') || 1, 10);

    checkAIRecommendationStatus(); // 페이지 로드 시 AI 상태 체크
    loadProductList(orderByParam, searchQuery, currentPage);

    // 정렬 버튼 클릭 시 호출
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', event => {
            const selectedOrder = event.target.textContent.trim();
            let orderByParam = '';
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search') || '';

            if (selectedOrder === '인기순') {
                orderByParam = 'likes';
            } else if (selectedOrder === '조회순') {
                orderByParam = 'hits';
            } else if (selectedOrder === '최신순') {
                orderByParam = 'created_at';
            }

            if (isAIRecommendationActive) {
                // AI 추천이 활성화된 경우, ai_search 파라미터 유지
                const aiSearchQuery = urlParams.get('ai_search') || '';
                const newUrl = `/api/products/home-page/?ai_search=${aiSearchQuery}&order_by=${orderByParam}&page=1`;
                window.history.pushState({ path: newUrl }, '', newUrl);
                sortAIRecommendations(orderByParam);  // AI 추천 상품 정렬
            } else {
                // 일반 검색일 경우, search 파라미터 사용
                const newUrl = `/api/products/home-page/?search=${searchQuery}&order_by=${orderByParam}&page=1`;
                window.history.pushState({ path: newUrl }, '', newUrl);
                loadProductList(orderByParam, searchQuery, 1);
            }
        });
    });
});

// 페이지네이션 컨트롤 업데이트 함수
function updatePaginationControls(searchQuery, orderByParam) {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    pageInfo.textContent = `${currentPage} / ${totalPages}`;

    if (currentPage > 1) {
        prevButton.disabled = false;
        prevButton.onclick = () => {
            const newUrl = `/home-page/?search=${searchQuery}&order_by=${orderByParam}&page=${currentPage - 1}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            loadProductList(orderByParam, searchQuery, currentPage - 1);
        };
    } else {
        prevButton.disabled = true;
    }

    if (currentPage < totalPages) {
        nextButton.disabled = false;
        nextButton.onclick = () => {
            const newUrl = `/home-page/?search=${searchQuery}&order_by=${orderByParam}&page=${currentPage + 1}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            loadProductList(orderByParam, searchQuery, currentPage + 1);
        };
    } else {
        nextButton.disabled = true;
    }
}

// 로딩창을 보여주는 함수
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

// 로딩창을 숨기는 함수
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// AI추천 관련
async function aiSearch() {
    const query = document.getElementById('ai-search-input').value;

    if (!query) {
        alert('요구사항을 입력해주세요.');
        return;
    }

    showLoading(); // 로딩창 표시

    try {
        const response = await fetch('/api/products/aisearch/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query }),
        });

        if (!response.ok) {
            throw new Error('AI 추천 요청 실패');
        }

        const data = await response.json();
        aiRecommendedProducts = data.response;  // AI 추천된 상품 목록 저장
        isAIRecommendationActive = true;  // AI 추천 상태 활성화
        isSearchActive = false;  // 검색 상태 비활성화

        // AI 추천 결과 페이지로 이동
        const newUrl = `/api/products/home-page/?ai_search=${query}&order_by=created_at&page=1`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        displayProductRecommendations(aiRecommendedProducts);
    } catch (error) {
        console.error('에러 발생:', error);
        alert('AI 추천을 불러오는데 문제가 발생했습니다.');
    } finally {
        hideLoading(); // 로딩창 숨김
    }
}

// AI 추천 상품 목록을 정렬하는 함수
function sortAIRecommendations(order_by) {
    if (order_by === 'likes') {
        aiRecommendedProducts.sort((a, b) => b.likes_count - a.likes_count);
    } else if (order_by === 'hits') {
        aiRecommendedProducts.sort((a, b) => b.hits - a.hits);
    } else if (order_by === 'created_at') {
        aiRecommendedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    displayProductRecommendations(aiRecommendedProducts);  // 정렬된 AI 추천 상품을 다시 표시
}

// 상품 목록을 카드 형태로 표시하는 함수 (검색 결과, AI 추천 모두 사용)
function displayProductRecommendations(products) {
    const productListContainer = document.getElementById('product-list-grid');
    productListContainer.innerHTML = '';  // 기존 목록 초기화

    const recommendationMessage = document.getElementById('ai-recommendation-message');

    if (isAIRecommendationActive) {
        recommendationMessage.textContent = "AI가 추천하는 상품입니다.";
        recommendationMessage.style.display = 'block'; // 문구 표시
    }

    products.forEach(product => {
        console.log("Product Data:", product); // `product` 객체를 로그로 확인
        if (!product.id) {
            console.error("상품 ID가 누락되었습니다.", product);
        }

        const productCard = `
        <div class="product-item" onclick="window.location.href='/api/products/detail-page/${product.id}/'" style="cursor: pointer;">
            <div class="product-image">
                <img src="${product.preview_image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>판매자: ${product.author}</p>
                <p class="product-price">${product.price}원</p>
                <p>찜수: ${product.likes_count}</p>
                <p>조회수: ${product.hits}</p>
            </div>
        </div>
    `;
    productListContainer.insertAdjacentHTML('beforeend', productCard);
    });

    currentPage = 1;
    totalPages = Math.ceil(products.length / 12); // 한 페이지에 12개의 상품이 보이도록 설정
    updatePaginationControls("", "");
}

// URL 변경 시 AI 추천 상태 비활성화
window.onpopstate = function () {
    checkAIRecommendationStatus();  // AI 추천 상태 체크
};