let currentPage = 1; // 현재 페이지 번호
let totalPages = 1;  // 전체 페이지 수 (초기값)

// 한 페이지에 표시할 상품의 수 (API와 동일하게 설정)
const ITEMS_PER_PAGE = 12; 

// 상품 목록을 가져오는 함수
async function loadProductList(order_by = '', search = '', page = 1) {
    const productListContainer = document.getElementById('product-list-grid');

    try {
        let apiUrl = `/api/products?search=${search}&order_by=${order_by}&page=${page}`;
        console.log(`API 호출 URL: ${apiUrl}`);  // URL 로그 출력

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('상품 목록을 불러오는데 실패했습니다.');
        }

        const products = await response.json();
        productListContainer.innerHTML = '';

        // 받은 데이터가 배열이 아니라면 results로 접근
        const productList = products.results || [];

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

        // 페이지네이션 정보 업데이트 (ITEMS_PER_PAGE 사용하여 정확한 전체 페이지 수 계산)
        currentPage = page; // 현재 페이지 업데이트
        totalPages = Math.ceil(products.count / ITEMS_PER_PAGE); // 전체 페이지 수 계산
        updatePaginationControls(search, order_by);

    } catch (error) {
        console.error('에러 발생:', error); // 에러 로그 확인
        alert('상품 목록을 불러올 수 없습니다.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded");
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';
    const orderByParam = urlParams.get('order_by') || 'created_at';
    currentPage = parseInt(urlParams.get('page') || 1, 10);

    loadProductList(orderByParam, searchQuery, currentPage);

    // 정렬 버튼 클릭 시 호출
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', event => {
            const selectedOrder = event.target.textContent.trim();
            let orderByParam = '';
            const searchQuery = urlParams.get('search') || '';

            if (selectedOrder === '인기순') {
                orderByParam = 'likes';
            } else if (selectedOrder === '조회순') {
                orderByParam = 'hits';
            } else if (selectedOrder === '최신순') {
                orderByParam = 'created_at';
            }

            const newUrl = `/home-page/?search=${searchQuery}&order_by=${orderByParam}&page=1`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            loadProductList(orderByParam, searchQuery, 1);
        });
    });
});

// 페이지네이션 컨트롤 업데이트 함수
function updatePaginationControls(searchQuery, orderByParam) {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    pageInfo.textContent = `${currentPage} / ${totalPages}`;

    // 이전 페이지 버튼 활성화 여부
    prevButton.disabled = currentPage <= 1;
    prevButton.onclick = currentPage > 1 ? () => {
        const newUrl = `${window.location.pathname}?search=${searchQuery}&order_by=${orderByParam}&page=${currentPage - 1}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        loadProductList(orderByParam, searchQuery, currentPage - 1);
    } : null;

    // 다음 페이지 버튼 활성화 여부
    nextButton.disabled = currentPage >= totalPages;
    nextButton.onclick = currentPage < totalPages ? () => {
        const newUrl = `${window.location.pathname}?search=${searchQuery}&order_by=${orderByParam}&page=${currentPage + 1}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        loadProductList(orderByParam, searchQuery, currentPage + 1);
    } : null;
}