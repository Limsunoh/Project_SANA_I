document.addEventListener("DOMContentLoaded", function () {
    const usernameDisplay = document.getElementById("username_display");
    const emailDisplay = document.getElementById("email_display");
    const createdAtDisplay = document.getElementById("created_at_display");
    const profileImage = document.getElementById("profile_image");
    const mannerScoreDisplay = document.getElementById("manner_score");
    const followingsCountDisplay = document.getElementById("followings_count");
    const followersCountDisplay = document.getElementById("followers_count");
    const likeProductsCountDisplay = document.getElementById("like_products_count");
    const myProductsContainer = document.getElementById("my-products");
    const myReviewsContainer = document.getElementById("my-reviews");
    const purchaseHistoryContainer = document.getElementById("purchase-history");

    const currentUsername = localStorage.getItem("current_username");
    const accessToken = localStorage.getItem("access_token");

    if (!currentUsername || !accessToken) {
        alert("로그인된 사용자 정보가 없습니다.");
        window.location.href = "/api/accounts/login-page/";
        return;
    }

    // 프로필 데이터 불러오기
    fetch(`/api/accounts/profile/${currentUsername}/`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            // 프로필 정보 반영
            usernameDisplay.textContent = data.nickname || data.username;
            emailDisplay.textContent = data.email;
            createdAtDisplay.textContent = `가입일: ${new Date(data.created_at).toLocaleDateString()}`;
            profileImage.src = data.profile_image || "/static/images/default_profile.jpg";
            mannerScoreDisplay.textContent = data.manner_score || "0.0";
            followingsCountDisplay.textContent = data.followings.length;
            followersCountDisplay.textContent = data.followers.length;
            likeProductsCountDisplay.textContent = data.like_products.length;

            // 내가 작성한 상품 리스트 추가
            if (data.products.length > 0) {
                data.products.slice(0, 4).forEach(product => {
                    const productCard = `
                    <div class="card m-2" style="width: 18rem;">
                        <img src="${product.preview_image}" class="card-img-top" alt="${product.title}">
                        <div class="card-body">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text">가격: ${product.price}원</p>
                        </div>
                    </div>
                    `;
                    myProductsContainer.insertAdjacentHTML("beforeend", productCard);
                });
            }

            // 내 후기 및 구매 내역은 추가 구현 필요
        })
        .catch(error => {
            console.error("프로필 정보를 불러오는 중 오류 발생:", error);
            alert("프로필 정보를 불러올 수 없습니다.");
        });

    // 프로필 수정 페이지로 이동
    document.getElementById("edit-profile-btn").addEventListener("click", () => {
        window.location.href = `/api/accounts/profile_edit-page/${currentUsername}`;
    });

    // 내가 작성한 상품 더보기 클릭 시
    document.getElementById("see-more-products").addEventListener("click", () => {
        window.location.href = `/api/products/user-products/${currentUsername}`;
    });
});
