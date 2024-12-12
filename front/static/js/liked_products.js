document.addEventListener('DOMContentLoaded', function () {
    const profileUsername = document.getElementById('profile-username').dataset.username;
    loadLikedProducts(profileUsername);
});

async function loadLikedProducts(username) {
    const likeProductsListContainer = document.getElementById('like-products-list');

    showLoading();

    try {
        const response = await fetch(`/api/accounts/likes/${username}/`, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('찜한 상품 목록을 불러오는데 실패했습니다.');
        }

        const likedProducts = await response.json();
        likeProductsListContainer.innerHTML = '';

        likedProducts.forEach(product => {
            const productCard = `
                <div class="card m-2" style="width: 18rem;">
                    <img src="${product.preview_image}" class="card-img-top" alt="${product.title}">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">가격: ${product.price}원</p>
                        <a href="/products/detail-page/${product.id}/" class="btn btn-primary">자세히 보기</a>
                    </div>
                </div>
            `;
            likeProductsListContainer.insertAdjacentHTML("beforeend", productCard);
        });

        if (likedProducts.length === 0) {
            likeProductsListContainer.innerHTML = "<p>찜한 상품이 없습니다.</p>";
        }

    } catch (error) {
        console.error('에러 발생:', error);
        likeProductsListContainer.innerHTML = "<p>찜한 상품 목록을 불러올 수 없습니다.</p>";
    } finally {
        hideLoading();
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
