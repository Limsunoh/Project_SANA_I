function products_detailpage(pk) {
    window.location.href = "/api/products/detail-page/" + pk + "/"
}

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
    
    let isFollowing = false;

    // URL에서 특정 profile username을 가져옴
    const profileUsername = window.location.pathname.split('/').filter(Boolean).pop();

    if (!profileUsername || !accessToken) {
        alert("잘못된 접근입니다. 로그인 후 다시 시도해주세요.");
        window.location.href = "/api/accounts/login-page/";
        return;
    }

    // 프로필 데이터 불러오기
    fetch(`/api/accounts/profile/${profileUsername}/`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    })
    .then(response => response.json())
    .then(profileData => {
        console.log("프로필 데이터:", profileData);
        if (usernameDisplay) usernameDisplay.textContent = profileData.nickname || profileData.username;
        if (emailDisplay) emailDisplay.textContent = profileData.email;

        if (profileData.created_at && createdAtDisplay) {
            createdAtDisplay.textContent = `가입일: ${new Date(profileData.created_at).toLocaleDateString("ko-KR")}`;
        } else if (createdAtDisplay) {
            createdAtDisplay.textContent = "가입일 정보가 없습니다.";
        }

        if (profileImage) profileImage.src = profileData.profile_image || "/static/images/default_profile.jpg";
        if (mannerScoreDisplay) mannerScoreDisplay.textContent = profileData.manner_score ? profileData.manner_score.toFixed(1) : "0.0";
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
                    const productCard = `
                    <div class="card m-2" style="width: 18rem; cursor:pointer;" onclick="products_detailpage(${product.id})" >
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
        })
        .catch(error => {
            console.error("프로필 정보를 불러오는 중 오류 발생:", error);
            alert("프로필 정보를 불러올 수 없습니다.");
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
                alert("매너점수 페이지로 이동합니다."); 
            });
        }

        if (followingsCountDisplay) {
            followingsCountDisplay.addEventListener("click", () => {
                window.location.href = `/api/accounts/followings/${username}`;
            });
        }

        if (followersCountDisplay) {
            followersCountDisplay.addEventListener("click", () => {
                window.location.href = `/api/accounts/followers/${username}`;
            });
        }

        if (likeProductsCountDisplay) {
            likeProductsCountDisplay.addEventListener("click", () => {
                window.location.href = `/api/products/like-products/${username}`;
            });
        }
    }

    // 프로필 수정 페이지로 이동
    const editProfileBtn = document.getElementById("edit-profile-btn");
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => {
            window.location.href = `/api/accounts/profile_edit-page/${profileUsername}`;
        });
    }

    // 비밀번호 수정 페이지로 이동
    document.getElementById("edit-password-btn").addEventListener("click", function() {
        window.location.href = `/api/accounts/profile/${profileUsername}/password-page/`;
    });
    
    // 내가 작성한 상품 더보기 클릭 시
    const seeMoreProductsBtn = document.getElementById("see-more-products");
    if (seeMoreProductsBtn) {
        seeMoreProductsBtn.addEventListener("click", () => {
            window.location.href = `/api/products/user-products-page/${profileUsername}`;
        });
    }
});