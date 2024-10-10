document.addEventListener("DOMContentLoaded", function () {
    // profile-info 요소를 가져옴
    const profileInfo = document.getElementById("profile-info");

    if (!profileInfo) {
        console.error("profile-info 요소를 찾을 수 없습니다.");
        return;
    }

    // 데이터 속성에서 username을 가져옴
    const profileUsername = profileInfo.getAttribute("data-username");

    if (!profileUsername) {
        console.error("username을 찾을 수 없습니다. HTML 파일에서 data-username 속성을 확인하세요.");
        return;
    }


    const userProductsList = document.getElementById("user-products-list");

    if (!userProductsList) {
        console.error("user-products-list 요소를 찾을 수 없습니다.");
        return;
    }

    // 상품 목록을 가져오는 로직 추가
    fetch(`/api/products/user-products/${profileUsername}/`)
        .then(response => response.json())
        .then(products => {
            if (products.length > 0) {
                products.forEach(product => {
                    const productCard = `
                        <div class="card m-2" style="width: 18rem;">
                            <img src="${product.preview_image}" class="card-img-top" alt="${product.title}">
                            <div class="card-body">
                                <h5 class="card-title">${product.title}</h5>
                                <p class="card-text">가격: ${product.price}원</p>
                                <a href="/api/products/detail-page/${product.id}/" class="btn btn-primary">자세히 보기</a>
                            </div>
                        </div>
                    `;
                    userProductsList.insertAdjacentHTML("beforeend", productCard);
                });
            } else {
                userProductsList.innerHTML = "<p>작성한 상품이 없습니다.</p>";
            }
        })
        .catch(error => {
            console.error("상품 목록을 불러오는 중 오류 발생:", error);
            userProductsList.innerHTML = "<p>상품 목록을 불러올 수 없습니다.</p>";
        });
});
