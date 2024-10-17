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

    const purchaseHistoryList = document.getElementById("purchase-history-list");

    if (!purchaseHistoryList) {
        console.error("purchase-history-list 요소를 찾을 수 없습니다.");
        return;
    }

    // 구매 내역 목록을 가져오는 로직 추가
    fetch(`/api/accounts/user/${profileUsername}/purchase-history/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('구매 내역을 불러오는 중 문제가 발생했습니다.');
            }
            return response.json();
        })
        .then(purchases => {
            if (purchases.length > 0) {
                purchases.forEach(purchase => {
                    const purchaseCard = `
                        <div class="card m-2" style="width: 15rem;">
                            <img src="${purchase.product_image}" class="card-img-top" alt="${purchase.title}">
                            <div class="card-body">
                                <h5 class="card-title">${purchase.title}</h5>
                                <p class="card-text">가격: ${purchase.price}원</p>
                                <a href="/api/products/detail-page/${purchase.id}/" class="btn btn-primary">자세히 보기</a>
                            </div>
                        </div>
                    `;
                    purchaseHistoryList.insertAdjacentHTML("beforeend", purchaseCard);
                });
            } else {
                purchaseHistoryList.innerHTML = "<p>구매한 내역이 없습니다.</p>";
            }
        })
        .catch(error => {
            console.error("구매 내역을 불러오는 중 오류 발생:", error);
            purchaseHistoryList.innerHTML = "<p>구매 내역을 불러올 수 없습니다.</p>";
        });
});
