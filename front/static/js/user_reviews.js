document.addEventListener("DOMContentLoaded", function () {
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

    const userReviewsList = document.getElementById("user-reviews-list");

    if (!userReviewsList) {
        console.error("user-reviews-list 요소를 찾을 수 없습니다.");
        return;
    }

    // 작성한 후기 목록을 가져오는 로직 추가
    fetch(`/api/accounts/user/${profileUsername}/reviews/`)
        .then(response => response.json())
        .then(reviews => {
            if (reviews.length > 0) {
                reviews.forEach(review => {
                    const reviewCard = `
                        <div class="card m-2" style="width: 18rem;">
                            <img src="${review.product_image}" class="card-img-top" alt="${review.product_title}">
                            <div class="card-body">
                                <h5 class="card-title">${review.product_title}</h5>
                                <p class="card-text">리뷰 작성일: ${new Date(review.created_at).toLocaleDateString("ko-KR")}</p>
                                <a href="/products/detail-page/${review.product_id}/" class="btn btn-primary">자세히 보기</a>
                            </div>
                        </div>
                    `;
                    userReviewsList.insertAdjacentHTML("beforeend", reviewCard);
                });
            } else {
                userReviewsList.innerHTML = "<p>작성한 후기가 없습니다.</p>";
            }
        })
        .catch(error => {
            console.error("후기 목록을 불러오는 중 오류 발생:", error);
            userReviewsList.innerHTML = "<p>후기 목록을 불러올 수 없습니다.</p>";
        });

});
