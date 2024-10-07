let currentPage = 1; // 현재 페이지 번호
let totalPages = 1;  // 전체 페이지 수 (초기값)

document.addEventListener('DOMContentLoaded', function () {
    // 페이지 로드 시, URL 파라미터를 기반으로 상품 목록을 불러옴
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';
    const orderByParam = urlParams.get('order_by') || 'created_at';
    currentPage = parseInt(urlParams.get('page') || 1, 10);

    // 페이지가 로드될 때 URL의 파라미터를 기준으로 상품 목록을 로드
    loadProductList(orderByParam, searchQuery, currentPage);

    // 정렬 버튼 클릭 시 호출
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', event => {
            const selectedOrder = event.target.textContent.trim();
            let orderByParam = '';

            if (selectedOrder === '인기순') {
                orderByParam = 'likes';
            } else if (selectedOrder === '조회순') {
                orderByParam = 'hits';
            } else if (selectedOrder === '최신순') {
                orderByParam = 'created_at';
            }

            // 정렬 기준에 따라 URL을 업데이트하고, 상품 목록 다시 불러오기
            const newUrl = `/home-page/?search=${searchQuery}&order_by=${orderByParam}&page=1`;
            window.history.pushState({ path: newUrl }, '', newUrl);

            loadProductList(orderByParam, searchQuery, 1);
        });
    });
});

// 상품 목록을 가져오는 함수
async function loadProductList(order_by = '', search = '', page = 1) {
    const productListContainer = document.getElementById('product-list-grid');

    try {
        let apiUrl = `/api/products/?order_by=${order_by}&page=${page}`;
        if (search) {
            apiUrl += `&search=${search}`;
        }
        console.log(`API 호출 URL: ${apiUrl}`);  // URL 로그 출력

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('상품 목록을 불러오는데 실패했습니다.');
        }

        const products = await response.json();
        console.log('서버에서 받은 데이터:', products);  // 서버로부터 받은 데이터 확인
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
        totalPages = Math.ceil(products.count / productList.length);
        updatePaginationControls(search, order_by);

    } catch (error) {
        console.error('에러 발생:', error);
        alert('상품 목록을 불러올 수 없습니다.');
    }
}


// 페이지네이션 컨트롤 업데이트 함수
function updatePaginationControls(searchQuery, orderByParam) {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    pageInfo.textContent = `${currentPage} / ${totalPages}`;

    // 이전 페이지 버튼 활성화 여부
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

    // 다음 페이지 버튼 활성화 여부
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
