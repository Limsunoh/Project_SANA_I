document.addEventListener('DOMContentLoaded', function () {
    const chatContainer = document.querySelector('.chat-container');
    const productId = chatContainer ? chatContainer.getAttribute('data-product-id') : null;
    const roomId = chatContainer ? chatContainer.getAttribute('data-room-id') : null;
    const token = localStorage.getItem("access_token");

    if (!productId || !roomId) {
        console.error("productId 또는 roomId를 찾을 수 없습니다. 데이터를 확인해 주세요.");
        return;
    }

    const transactionStatusUrl = `http://127.0.0.1:8000/api/products/${productId}/chatrooms/${roomId}/transaction-status/`;

    // 거래 완료 버튼
    const completeTransactionBtn = document.getElementById('complete-transaction-btn');
    const writeReviewBtn = document.getElementById('write-review-btn');

    // 거래 상태를 확인하는 함수
    function checkTransactionStatus() {
        $.ajax({
            url: transactionStatusUrl,
            type: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function (response) {
                if (response.is_sold && response.is_completed) {
                    // 판매자와 구매자 모두 거래 완료 상태일 때 리뷰 작성 버튼 활성화
                    writeReviewBtn.disabled = false;
                }
            },
            error: function (xhr, status, error) {
                console.error("거래 상태 불러오기 실패:", status, error);
            }
        });
    }

    // 페이지 로드 시 거래 상태 확인
    $(document).ready(function () {
        checkTransactionStatus();
    });

    // 거래 완료 버튼 클릭 이벤트
    completeTransactionBtn.addEventListener('click', function () {
        $.ajax({
            url: transactionStatusUrl,
            type: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                is_sold: true  // 거래 완료 상태 전송
            }),
            success: function (response) {
                alert("거래가 완료되었습니다.");
                // 거래 상태 다시 확인하여 리뷰 작성 버튼 활성화
                checkTransactionStatus();
            },
            error: function (xhr, status, error) {
                console.error("거래 완료 요청 실패:", status, error);
                alert("거래 완료 요청에 실패했습니다.");
            }
        });
    });

    // 리뷰 작성 버튼 클릭 이벤트
    writeReviewBtn.addEventListener('click', function () {
        if (writeReviewBtn.disabled) {
            alert("거래가 완료된 후 리뷰를 작성할 수 있습니다.");
            return;
        }

        // 리뷰 작성 페이지로 리디렉션 (예: 리뷰 작성 페이지 URL)
        window.location.href = `/reviews/write/${productId}/`;
    });
});
