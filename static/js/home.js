let currentPage = 1; // 현재 페이지 번호
let totalPages = 1;  // 전체 페이지 수 (초기값)

async function loadProductList(order_by = '', page = 1) {
    const productListContainer = document.getElementById('product-list-grid');

    try {
        // order_by와 page 파라미터를 URL에 올바르게 추가
        const apiUrl = `/api/products/?order_by=${order_by}&page=${page}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('상품 목록을 불러오는데 실패했습니다.');
        }

        const products = await response.json();
        productListContainer.innerHTML = '';

        // 받은 데이터가 배열이 아니라면 results로 접근
        const productList = products.results;

        productList.forEach(product => {
            const productCard = `
                <div class="product-item">
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

        // 페이지네이션 정보 업데이트
        currentPage = page; // 현재 페이지 업데이트
        totalPages = Math.ceil(products.count / productList.length); // 전체 페이지 수 계산
        updatePaginationControls();

    } catch (error) {
        console.error('에러 발생:', error); // 에러 로그 확인
        alert('상품 목록을 불러올 수 없습니다.');
    }
}

// 페이지네이션 컨트롤 업데이트 함수
function updatePaginationControls() {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    pageInfo.textContent = `${currentPage} /  ${totalPages}`;

    // 이전 페이지 버튼 활성화 여부
    if (currentPage > 1) {
        prevButton.disabled = false;
    } else {
        prevButton.disabled = true;
    }

    // 다음 페이지 버튼 활성화 여부
    if (currentPage < totalPages) {
        nextButton.disabled = false;
    } else {
        nextButton.disabled = true;
    }
}

// 페이지네이션 버튼 클릭 이벤트 리스너 추가
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        loadProductList('', currentPage - 1);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
        loadProductList('', currentPage + 1);
    }
});

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
        loadProductList(orderByParam, 1); // 정렬 변경 시 첫 페이지로 이동
    });
});

// 페이지가 로드될 때 기본 정렬을 최신순으로 설정
document.addEventListener('DOMContentLoaded', () => {
    loadProductList('created_at');
});
