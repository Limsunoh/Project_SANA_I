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

    const userReceivedReviewsList = document.getElementById("user-received-reviews-list");

    if (!userReceivedReviewsList) {
        console.error("user-received-reviews-list 요소를 찾을 수 없습니다.");
        return;
    }

    // 받은 후기 목록을 가져오는 로직 추가
    fetch(`/api/accounts/user/${profileUsername}/received-reviews/`)
        .then(response => response.json())
        .then(reviews => {
            if (reviews.length > 0) {
                reviews.forEach(review => {
                    const reviewCard = `
                        <div class="card m-2" style="width: 18rem;">
                            <div class="card-body">
                                <h5 class="card-title">${review.product_title}</h5>
                                <p class="card-text">체크리스트: ${review.checklist.join(', ')}</p>
                                <p class="card-text">추가 코멘트: ${review.additional_comments}</p>
                                <p class="card-text">점수: ${review.score}</p>
                                <p class="card-text">작성일: ${new Date(review.created_at).toLocaleDateString("ko-KR")}</p>
                            </div>
                        </div>
                    `;
                    userReceivedReviewsList.insertAdjacentHTML("beforeend", reviewCard);
                });
            } else {
                userReceivedReviewsList.innerHTML = "<p>받은 후기가 없습니다.</p>";
            }
        })
        .catch(error => {
            console.error("받은 후기 목록을 불러오는 중 오류 발생:", error);
            userReceivedReviewsList.innerHTML = "<p>받은 후기 목록을 불러올 수 없습니다.</p>";
        });
});
