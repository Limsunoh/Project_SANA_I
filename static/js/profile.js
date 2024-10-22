function products_detailpage(pk) {
    window.location.href = "/api/products/detail-page/" + pk + "/"
}

const deleteProfileBtn = document.getElementById("delete-profile-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

document.addEventListener("DOMContentLoaded", function () {
    const usernameDisplay = document.getElementById("username_display");
    const emailDisplay = document.getElementById("email_display");
    const createdAtDisplay = document.getElementById("created_at_display");
    const profileImage = document.getElementById("profile_image");
    const mannerScoreDisplay = document.getElementById("manner_score");
    const followingsCountDisplay = document.getElementById("followings_count");
    const followersCountDisplay = document.getElementById("followers_count");
    const likeProductsCountDisplay = document.getElementById("like_products_count");
    const followButton = document.getElementById("follow-button");
    const profileAddressDisplay = document.getElementById("profile_address");
    const introduceDisplay = document.getElementById("introduce_display");
    const accessToken = localStorage.getItem("access_token");
    const currentUsername = localStorage.getItem("current_username");

    const editProfileBtn = document.getElementById("edit-profile-btn");
    const editPasswordBtn = document.getElementById("edit-password-btn");


    let isFollowing = false;

    // URL에서 특정 profile username을 가져옴
    const profileUsername = decodeURI(window.location.pathname.split('/').filter(Boolean).pop());

    if (!profileUsername || !accessToken) {
        alert("잘못된 접근입니다. 로그인 후 다시 시도해주세요.");
        window.location.href = "/api/accounts/login-page/";
        return;
    }

    if (currentUsername !== profileUsername) {
        editProfileBtn.style.display = 'none';
        editPasswordBtn.style.display = 'none';
        deleteProfileBtn.style.display = 'none';
    }else{
        followButton.style.display = 'none';
    }

    // 프로필 데이터 불러오기
    fetch(`/api/accounts/profile/${profileUsername}/`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    })
    .then(response => response.json())
    .then(profileData => {
        if (usernameDisplay) usernameDisplay.textContent = profileData.nickname || profileData.username;
        if (emailDisplay) emailDisplay.textContent = profileData.email;

        if (profileData.created_at && createdAtDisplay) {
            createdAtDisplay.textContent = `가입일: ${new Date(profileData.created_at).toLocaleDateString("ko-KR")}`;
        } else if (createdAtDisplay) {
            createdAtDisplay.textContent = "가입일 정보가 없습니다.";
        }

        if (profileImage) profileImage.src = profileData.profile_image || "/static/images/default_profile.jpg";
        if (mannerScoreDisplay) mannerScoreDisplay.textContent = profileData.total_score ? profileData.total_score.toFixed(1) : "0.0";
        if (followingsCountDisplay) followingsCountDisplay.textContent = profileData.followings ? profileData.followings.length : "0";
        if (followersCountDisplay) followersCountDisplay.textContent = profileData.followers ? profileData.followers.length : "0";
        if (likeProductsCountDisplay) likeProductsCountDisplay.textContent = profileData.like_products ? profileData.like_products.length : "0";

        const mainAddress = profileData.mainaddress || '';
        if (profileAddressDisplay) profileAddressDisplay.textContent = mainAddress.split(" ").slice(0, 2).join(" ") || '지역명 없음';
        if (introduceDisplay) introduceDisplay.textContent = profileData.introduce || '자기소개가 없습니다.';

        return fetch(`/api/accounts/follow/${profileUsername}/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
    })
    .then(response => response.json())
    .then(followData => {
        isFollowing = followData.is_following;
        if (followButton) updateFollowButton();
    })
    .catch(error => {
        console.error("팔로우 여부 확인 중 오류 발생:", error);
    });

    // 팔로우 버튼을 클릭했을 때
    if (followButton) {
        followButton.addEventListener("click", function () {
            followButton.disabled = true;

            fetch(`/api/accounts/follow/${profileUsername}/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("서버 응답 오류 발생");
                }
                return response.text();
            })
            .then(result => {

                if (result === "\"follow했습니다.\"") {
                    isFollowing = true;
                    if (followersCountDisplay) followersCountDisplay.textContent = (parseInt(followersCountDisplay.textContent) + 1).toString();
                } else if (result === "\"unfollow했습니다.\"") {
                    isFollowing = false;
                    if (followersCountDisplay) followersCountDisplay.textContent = Math.max(0, parseInt(followersCountDisplay.textContent) - 1).toString();
                } else {
                    console.error("예상치 못한 서버 응답:", result);
                }
                updateFollowButton(); // 팔로우 상태 업데이트 후 버튼 갱신
            })
            .catch(error => {
                console.error("팔로우/언팔로우 요청 중 오류 발생:", error);
            })
            .finally(() => {
                followButton.disabled = false;
            });
        });
    }

    // 팔로우 버튼 상태 업데이트 함수
    function updateFollowButton() {
        followButton.textContent = isFollowing ? "언팔로우" : "팔로우";
        if (isFollowing) {
            followButton.classList.remove("btn-primary");
            followButton.classList.add("btn-outline-primary");
        } else {
            followButton.classList.add("btn-primary");
            followButton.classList.remove("btn-outline-primary");
        }
    }

    // 내가 작성한 상품 리스트 추가
    if (document.getElementById("my-products")) {
        fetch(`/api/accounts/profile/${profileUsername}/`, {
            headers: { "Authorization": `Bearer ${accessToken}` },
        })
        .then(response => response.json())
        .then(profileData => {
            if (profileData.products && profileData.products.length > 0) {
                const myProductsContainer = document.getElementById("my-products");

                profileData.products.slice(0, 4).forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.classList.add("card", "m-2");
                    productCard.style.width = "18rem";
                    productCard.style.cursor = "pointer";
                    productCard.onclick = function () {
                        products_detailpage(product.id);
                    };

                    const productImg = document.createElement("img");
                    productImg.src = product.preview_image;
                    productImg.classList.add("card-img-top");
                    productImg.alt = product.title;

                    const productBody = document.createElement("div");
                    productBody.classList.add("card-body");

                    const productTitle = document.createElement("h5");
                    productTitle.classList.add("card-title");
                    productTitle.textContent = product.title;

                    const productPrice = document.createElement("p");
                    productPrice.classList.add("card-text");
                    productPrice.textContent = `가격: ${product.price}원`;

                    productBody.appendChild(productTitle);
                    productBody.appendChild(productPrice);
                    productCard.appendChild(productImg);
                    productCard.appendChild(productBody);

                    myProductsContainer.appendChild(productCard);
                });
            }
        })
        .catch(error => {
            console.error("프로필 정보를 불러오는 중 오류 발생:", error);
            alert("프로필 정보를 불러올 수 없습니다.");
        });
    }

    if (document.getElementById("my-reviews")) {
        fetch(`/api/accounts/user/${profileUsername}/reviews/`, {
            headers: { "Authorization": `Bearer ${accessToken}` },
        })
        .then(response => response.json())
        .then(reviews => {
            if (reviews.length > 0) {
                const myReviewsContainer = document.getElementById("my-reviews");
                reviews.slice(0, 4).forEach(review => {
                    const reviewCard = document.createElement("div");
                    reviewCard.classList.add("card", "m-2");
                    reviewCard.style.width = "18rem";

                    const reviewImg = document.createElement("img");
                    reviewImg.src = review.product_image;
                    reviewImg.classList.add("card-img-top");
                    reviewImg.alt = review.product_title;

                    const reviewBody = document.createElement("div");
                    reviewBody.classList.add("card-body");

                    const reviewTitle = document.createElement("h5");
                    reviewTitle.classList.add("card-title");
                    reviewTitle.textContent = review.product_title;

                    const reviewDate = document.createElement("p");
                    reviewDate.classList.add("card-text");
                    reviewDate.textContent = `리뷰 작성일: ${new Date(review.created_at).toLocaleDateString("ko-KR")}`;

                    const detailLink = document.createElement("a");
                    detailLink.href = `/api/products/detail-page/${review.product_id}/`;
                    detailLink.classList.add("btn", "btn-primary");
                    detailLink.textContent = "자세히 보기";

                    reviewBody.appendChild(reviewTitle);
                    reviewBody.appendChild(reviewDate);
                    reviewBody.appendChild(detailLink);
                    reviewCard.appendChild(reviewImg);
                    reviewCard.appendChild(reviewBody);

                    myReviewsContainer.appendChild(reviewCard);
                });
            }
        })
        .catch(error => {
            console.error("작성한 후기 정보를 불러오는 중 오류 발생:", error);
            alert("작성한 후기 정보를 불러올 수 없습니다.");
        });
    }
    // 구매 내역
    if (document.getElementById("purchase-history")) {
        fetch(`/api/accounts/user/${profileUsername}/purchase-history/`, {
            headers: { "Authorization": `Bearer ${accessToken}` },
        })
        .then(response => response.json())
        .then(purchases => {
            if (purchases.length > 0) {
                const purchaseHistoryContainer = document.getElementById("purchase-history");
                purchases.slice(0, 4).forEach(purchase => {
                    const purchaseCard = document.createElement("div");
                    purchaseCard.classList.add("card", "m-2");
                    purchaseCard.style.width = "18rem";

                    const purchaseImg = document.createElement("img");
                    purchaseImg.src = purchase.product_image;
                    purchaseImg.classList.add("card-img-top");
                    purchaseImg.alt = purchase.title;

                    const purchaseBody = document.createElement("div");
                    purchaseBody.classList.add("card-body");

                    const purchaseTitle = document.createElement("h5");
                    purchaseTitle.classList.add("card-title");
                    purchaseTitle.textContent = purchase.title;

                    const purchasePrice = document.createElement("p");
                    purchasePrice.classList.add("card-text");
                    purchasePrice.textContent = `가격: ${purchase.price}원`;

                    const detailLink = document.createElement("a");
                    detailLink.href = `/api/products/detail-page/${purchase.id}/`;
                    detailLink.classList.add("btn", "btn-primary");
                    detailLink.textContent = "자세히 보기";

                    purchaseBody.appendChild(purchaseTitle);
                    purchaseBody.appendChild(purchasePrice);
                    purchaseBody.appendChild(detailLink);
                    purchaseCard.appendChild(purchaseImg);
                    purchaseCard.appendChild(purchaseBody);

                    purchaseHistoryContainer.appendChild(purchaseCard);
                });
            }
        })
        .catch(error => {
            console.error("구매 내역을 불러오는 중 오류 발생:", error);
            alert("구매내역 정보를 불러올 수 없습니다.");
        });
    }

    // 클릭 가능한 통계 항목 설정
    addClickEventsToStats(profileUsername);

    // 통계 항목에 클릭 이벤트 추가 (매너점수, 팔로우, 팔로워, 찜)
    function addClickEventsToStats(username) {
        if (mannerScoreDisplay) mannerScoreDisplay.style.cursor = "pointer";
        if (followingsCountDisplay) followingsCountDisplay.style.cursor = "pointer";
        if (followersCountDisplay) followersCountDisplay.style.cursor = "pointer";
        if (likeProductsCountDisplay) likeProductsCountDisplay.style.cursor = "pointer";

        if (mannerScoreDisplay) {
            mannerScoreDisplay.addEventListener("click", () => {
                window.location.href = `/api/accounts/user/${username}/received-reviews`;
            });
        }

        if (followingsCountDisplay) {
            followingsCountDisplay.addEventListener("click", () => {
                window.location.href = `/api/accounts/profile/${username}/followings`;
            });
        }

        if (followersCountDisplay) {
            followersCountDisplay.addEventListener("click", () => {
                window.location.href = `/api/accounts/profile/${username}/followers`;
            });
        }

        if (likeProductsCountDisplay) {
            likeProductsCountDisplay.addEventListener("click", () => {
                window.location.href = `/api/accounts/user/${username}/like-products/`;
            });
        }
    }

    // 프로필 수정 페이지로 이동
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => {
            window.location.href = `/api/accounts/profile_edit-page/${profileUsername}`;
        });
    }

    // 비밀번호 수정 페이지로 이동
    editPasswordBtn.addEventListener("click", function() {
        window.location.href = `/api/accounts/profile/${profileUsername}/password-page/`;
    });

    // 내가 작성한 상품 더보기 클릭 시
    const seeMoreProductsBtn = document.getElementById("see-more-products");
    if (seeMoreProductsBtn) {
        seeMoreProductsBtn.addEventListener("click", () => {
            window.location.href = `/api/accounts/user-products-page/${profileUsername}`;
        });
    }

    // 작성한 후기 더보기 버튼 클릭 시
    const seeMoreReviewsBtn = document.getElementById("see-more-reviews");
    if (seeMoreReviewsBtn) {
        seeMoreReviewsBtn.addEventListener("click", () => {
            window.location.href = `/api/accounts/user/${profileUsername}/reviews-page/`;
        });
    }

    // 구매 내역 더보기 버튼 클릭 시
    const seeMorePurchaseBtn = document.getElementById("see-more-purchase");
    if (seeMorePurchaseBtn) {
        seeMorePurchaseBtn.addEventListener("click", () => {
            window.location.href = `/api/accounts/user/${profileUsername}/purchase-history-page/`;
        });
    }

    // 매너 점수 클릭 시 받은 후기 목록으로 이동
    if (mannerScoreDisplay) {
        mannerScoreDisplay.addEventListener("click", () => {
            window.location.href = `/api/accounts/user/${profileUsername}/received-reviews-page/`;
        });
    }
});


// 계정 삭제
document.addEventListener("DOMContentLoaded", function () {
    // 계정이 이미 비활성화된 상태인지 체크하는 플래그
    let isAccountDeactivated = false;

    // Bootstrap 모달 객체 생성
    const deleteAccountModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));

    // 계정 삭제 버튼 클릭 시 모달 열기
    deleteProfileBtn.addEventListener("click", function () {
        deleteAccountModal.show();
    });

    // "예" 버튼 클릭 시 계정 비활성화
    confirmDeleteBtn.addEventListener("click", function () {
        if (isAccountDeactivated) {
            alert("계정이 이미 비활성화되었습니다.");
            return;
        }

        const profileUsername = window.location.pathname.split('/').filter(Boolean).pop();
        const accessToken = localStorage.getItem("access_token");

        fetch(`/api/accounts/profile/${profileUsername}/`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            }
        })
        .then(response => {
            if (response.ok) {
                // 성공적으로 비활성화된 경우
                isAccountDeactivated = true; // 비활성화 상태 플래그 설정
                localStorage.removeItem("access_token"); // 토큰 삭제
                return response.text().then(text => {
                    return text ? JSON.parse(text) : {}; // 응답이 있으면 파싱
                });
            } else if (response.status === 403) {
                // 403 에러일 경우 추가 요청 방지
                throw new Error('계정이 이미 비활성화되었거나 권한이 없습니다.');
            } else {
                throw new Error('계정 비활성화에 실패했습니다.');
            }
        })
        .then(data => {
            alert(data.message || '계정이 성공적으로 비활성화되었습니다.');
            window.location.href = "/"; // 홈으로 이동
        })
        .catch(error => {
            console.error('계정 비활성화 중 오류 발생:', error);
            alert(error.message || '계정 비활성화에 실패했습니다.');
        });
    });

});
