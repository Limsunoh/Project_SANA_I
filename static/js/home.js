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
    

    try {
        let apiUrl = `/api/products/?search=${search}&order_by=${order_by}&page=${page}`;
        console.log(`API 호출 URL: ${apiUrl}`);  // URL 로그 출력

        // fetchWithOptionalAuth 사용
        const response = await fetchWithOptionalAuth(apiUrl);

        if (!response.ok) {
            throw new Error('상품 목록을 불러오는데 실패했습니다.');
        }

        const products = await response.json();
        productListContainer.innerHTML = '';

        const productList = products.results;
        productList.forEach(product => {
            // HTML에 텍스트를 안전하게 삽입하기 위해 텍스트 부분을 textContent로 처리
            const productCard = document.createElement('div');
            productCard.classList.add('product-item');
            productCard.onclick = function () {
                window.location.href = `/api/products/detail-page/${product.id}/`;
            };
            
            const productImage = document.createElement('div');
            productImage.classList.add('product-image');
            const img = document.createElement('img');
            img.src = product.preview_image;
            img.alt = product.title;
            productImage.appendChild(img);

            const productInfo = document.createElement('div');
            productInfo.classList.add('product-info');

            const title = document.createElement('h3');
            title.textContent = product.title; // textContent 사용
            productInfo.appendChild(title);

            const author = document.createElement('p');
            author.textContent = `판매자: ${product.author}`; // textContent 사용
            productInfo.appendChild(author);

            const price = document.createElement('p');
            price.classList.add('product-price');
            price.textContent = `${product.price}원`; // textContent 사용
            productInfo.appendChild(price);

            const likes = document.createElement('p');
            likes.textContent = `찜수: ${product.likes_count}`; // textContent 사용
            productInfo.appendChild(likes);

            const hits = document.createElement('p');
            hits.textContent = `조회수: ${product.hits}`; // textContent 사용
            productInfo.appendChild(hits);

            productCard.appendChild(productImage);
            productCard.appendChild(productInfo);
            productListContainer.appendChild(productCard);
        });

        currentPage = page;
        totalPages = Math.ceil(products.count / 12); // 한 페이지에 12개의 상품이 보이도록 설정
        updatePaginationControls(search, order_by);
    } catch (error) {
        console.error('에러 발생:', error);
        alert('상품 목록을 불러올 수 없습니다.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';
    const hashtagQuery = urlParams.get('hashtag') || '';
    const orderByParam = urlParams.get('order_by') || 'created_at';
    currentPage = parseInt(urlParams.get('page') || 1, 10);

    checkAIRecommendationStatus(); // 페이지 로드 시 AI 상태 체크

    // 해시태그가 있으면 해시태그로 필터링, 없으면 일반 검색어로 필터링
    if (hashtagQuery) {
        loadProductList(orderByParam, hashtagQuery, currentPage);
    } else {
        loadProductList(orderByParam, searchQuery, currentPage);
    }

    // 정렬 버튼 클릭 시 호출
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', event => {
            const selectedOrder = event.target.textContent.trim();
            let orderByParam = '';
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search') || '';
            const dropdownButton = document.querySelector('.dropdown-toggle');

            if (selectedOrder === '인기순') {
                orderByParam = 'likes';
                dropdownButton.textContent = '인기순';
            } else if (selectedOrder === '조회순') {
                orderByParam = 'hits';
                dropdownButton.textContent = '조회순';
            } else if (selectedOrder === '최신순') {
                orderByParam = 'created_at';
                dropdownButton.textContent = '최신순';
            }

            if (isAIRecommendationActive) {
                // AI 추천이 활성화된 경우, ai_search 파라미터 유지
                const aiSearchQuery = urlParams.get('ai_search') || '';
                const newUrl = `/?ai_search=${aiSearchQuery}&order_by=${orderByParam}&page=1`;
                window.history.pushState({ path: newUrl }, '', newUrl);
                sortAIRecommendations(orderByParam);  // AI 추천 상품 정렬
            } else if (hashtagQuery) {
                // 해시태그 필터링
                const newUrl = `/?hashtag=${hashtagQuery}&order_by=${orderByParam}&page=1`;
                window.history.pushState({ path: newUrl }, '', newUrl);
                loadProductList(orderByParam, '', 1, hashtagQuery);
            } else {
                // 일반 검색어 필터링
                const newUrl = `/?search=${searchQuery}&order_by=${orderByParam}&page=1`;
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
            const newUrl = `/?search=${searchQuery}&order_by=${orderByParam}&page=${currentPage - 1}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            loadProductList(orderByParam, searchQuery, currentPage - 1);
        };
    } else {
        prevButton.disabled = true;
    }

    if (currentPage < totalPages) {
        nextButton.disabled = false;
        nextButton.onclick = () => {
            const newUrl = `/?search=${searchQuery}&order_by=${orderByParam}&page=${currentPage + 1}`;
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

    showLoading();

    try {
        const apiUrl = '/api/products/aisearch/';
        const requestBody = JSON.stringify({ query: query });

        // fetchWithOptionalAuth 사용
        const response = await fetchWithOptionalAuth(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error('AI 추천 요청 실패');
        }

        const data = await response.json();
        aiRecommendedProducts = data.response;  // AI 추천된 상품 목록 저장
        isAIRecommendationActive = true;  // AI 추천 상태 활성화
        isSearchActive = false;  // 검색 상태 비활성화

        // AI 추천 결과 페이지로 이동
        const newUrl = `/?ai_search=${query}&order_by=created_at&page=1`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        displayProductRecommendations(aiRecommendedProducts);
    } catch (error) {
        console.error('에러 발생:', error);
        alert('AI 추천을 불러오는데 문제가 발생했습니다.');
    } finally {
        hideLoading();
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
        recommendationMessage.style.display = 'block';
    }

    products.forEach(product => {
        if (!product.id) {
            console.error("상품 ID가 누락되었습니다.", product);
            return;
        }

        // 안전한 DOM 조작을 사용하여 상품 정보를 삽입
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.style.cursor = 'pointer';
        productItem.addEventListener('click', () => {
            window.location.href = `/api/products/detail-page/${product.id}/`;
        });

        const productImage = document.createElement('div');
        productImage.classList.add('product-image');
        const img = document.createElement('img');
        img.src = product.preview_image;  // 이미지 경로는 신뢰된 데이터일 경우만 사용
        img.alt = product.title;  // 안전한 DOM 삽입
        productImage.appendChild(img);

        const productInfo = document.createElement('div');
        productInfo.classList.add('product-info');

        const titleElement = document.createElement('h3');
        titleElement.textContent = product.title;  // HTML 엔티티 인코딩 대신 DOM 사용
        const authorElement = document.createElement('p');
        authorElement.textContent = `판매자: ${product.author}`;  // 안전하게 textContent 사용
        const priceElement = document.createElement('p');
        priceElement.classList.add('product-price');
        priceElement.textContent = `${product.price}원`;
        const likesElement = document.createElement('p');
        likesElement.textContent = `찜수: ${product.likes_count}`;
        const hitsElement = document.createElement('p');
        hitsElement.textContent = `조회수: ${product.hits}`;

        // 상품 정보를 product-info에 추가
        productInfo.appendChild(titleElement);
        productInfo.appendChild(authorElement);
        productInfo.appendChild(priceElement);
        productInfo.appendChild(likesElement);
        productInfo.appendChild(hitsElement);

        // product-item에 이미지와 정보를 추가
        productItem.appendChild(productImage);
        productItem.appendChild(productInfo);

        // 최종적으로 productListContainer에 삽입
        productListContainer.appendChild(productItem);
    });

    currentPage = 1;
    totalPages = Math.ceil(products.length / 12); // 한 페이지에 12개의 상품이 보이도록 설정
    updatePaginationControls("", "");
}

// URL 변경 시 AI 추천 상태 비활성화
window.onpopstate = function () {
    checkAIRecommendationStatus();  // AI 추천 상태 체크
};