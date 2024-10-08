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
        usernameDisplay.textContent = profileData.nickname || profileData.username;
        emailDisplay.textContent = profileData.email;

        if (profileData.created_at) {
            createdAtDisplay.textContent = `가입일: ${new Date(profileData.created_at).toLocaleDateString("ko-KR")}`;
        } else {
            createdAtDisplay.textContent = "가입일 정보가 없습니다.";
        }

        profileImage.src = profileData.profile_image || "/static/images/default_profile.jpg";
        mannerScoreDisplay.textContent = profileData.manner_score ? profileData.manner_score.toFixed(1) : "0.0";
        followingsCountDisplay.textContent = profileData.followings ? profileData.followings.length : "0";
        followersCountDisplay.textContent = profileData.followers ? profileData.followers.length : "0";
        likeProductsCountDisplay.textContent = profileData.like_products ? profileData.like_products.length : "0";

        const mainAddress = profileData.mainaddress || '';
        profileAddressDisplay.textContent = mainAddress.split(" ").slice(0, 2).join(" ") || '지역명 없음';
        introduceDisplay.textContent = profileData.introduce || '자기소개가 없습니다.';

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
        console.log("팔로우 여부 확인:", followData.is_following);
        isFollowing = followData.is_following;
        updateFollowButton(); // 초기 버튼 상태 설정
    })
    .catch(error => {
        console.error("팔로우 여부 확인 중 오류 발생:", error);
    });

    // 팔로우 버튼 클릭 이벤트 등록
    if (followButton) {
        followButton.addEventListener("click", function () {
            console.log("팔로우 버튼 클릭");
            followButton.disabled = true;

            fetch(`/api/accounts/follow/${profileUsername}/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            })
            .then(response => {
                console.log("서버 응답:", response);
                if (!response.ok) {
                    throw new Error("서버 응답 오류 발생");
                }
                return response.text();
            })
            .then(result => {
                console.log("서버 응답 데이터:", result);
                console.log(result);
                
                if (result === "\"follow했습니다.\"") {
                    isFollowing = true;
                    console.log("A",parseInt(followersCountDisplay.textContent) + 1)
                    followersCountDisplay.textContent = (parseInt(followersCountDisplay.textContent) + 1).toString();
                } else if (result === "\"unfollow했습니다.\"") {
                    isFollowing = false;
                    console.log("B",parseInt(followersCountDisplay.textContent) - 1)
                    followersCountDisplay.textContent = Math.max(0, parseInt(followersCountDisplay.textContent) - 1).toString();
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
        followButton.textContent = "팔로우";
        followButton.classList.add("btn-primary");
        followButton.classList.remove("btn-outline-primary");
        console.log("버튼 텍스트 갱신됨:", followButton.textContent);
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
        mannerScoreDisplay.style.cursor = "pointer";
        followingsCountDisplay.style.cursor = "pointer";
        followersCountDisplay.style.cursor = "pointer";
        likeProductsCountDisplay.style.cursor = "pointer";

        mannerScoreDisplay.addEventListener("click", () => {
            alert("매너점수 페이지로 이동합니다."); 
        });

        followingsCountDisplay.addEventListener("click", () => {
            window.location.href = `/api/accounts/followings/${username}`;
        });

        followersCountDisplay.addEventListener("click", () => {
            window.location.href = `/api/accounts/followers/${username}`;
        });

        likeProductsCountDisplay.addEventListener("click", () => {
            window.location.href = `/api/products/like-products/${username}`;
        });
    }

    // 프로필 수정 페이지로 이동
    document.getElementById("edit-profile-btn").addEventListener("click", () => {
        window.location.href = `/api/accounts/profile_edit-page/${currentUsername}`;
    });

    // 내가 작성한 상품 더보기 클릭 시
    document.getElementById("see-more-products").addEventListener("click", () => {
        window.location.href = `/api/products/user-products/${currentUsername}`;
    });
});
