document.addEventListener('DOMContentLoaded', function () {
    const chatContainer = document.querySelector('.chat-container');
    const productId = chatContainer ? chatContainer.getAttribute('data-product-id') : null;
    const roomId = chatContainer ? chatContainer.getAttribute('data-room-id') : null;
    const currentUser = localStorage.getItem('current_username');  // 현재 로그인한 유저 이름

    if (!productId || !roomId) {
        console.error("productId 또는 roomId를 찾을 수 없습니다. 데이터를 확인해 주세요.");
        return;
    }

    const apiUrl = `http://127.0.0.1:8000/api/products/${productId}/chatrooms/${roomId}/messages/`;
    const transactionStatusUrl = `http://127.0.0.1:8000/api/products/${productId}/chatrooms/${roomId}/transaction-status/`;
    const token = localStorage.getItem("access_token");

    const completeTransactionBtn = document.getElementById('complete-transaction-btn');
    const writeReviewBtn = document.getElementById('write-review-btn');
    let transactionCompleted = false;

    // 거래 상태를 확인하는 함수
    function checkTransactionStatus() {
        $.ajax({
            url: transactionStatusUrl,
            type: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function (response) {
                console.log("거래 상태:", response);
    
                transactionCompleted = response.is_sold;
                const isBuyer = response.buyer === currentUser;
                const isSeller = response.seller === currentUser;
    
                console.log(`is_sold: ${response.is_sold}, is_completed: ${response.is_completed}, isBuyer: ${isBuyer}`);
    
                if (transactionCompleted && response.is_completed && isBuyer) {
                    writeReviewBtn.disabled = false;  // 구매자만 리뷰 작성 가능
                    console.log("리뷰 작성 버튼 활성화");
                } else {
                    writeReviewBtn.disabled = true;
                    console.log("리뷰 작성 버튼 비활성화");
                }
    
                if (transactionCompleted) {
                    completeTransactionBtn.textContent = isSeller ? "판매 완료 취소" : "거래 취소";
                } else {
                    completeTransactionBtn.textContent = isSeller ? "판매 완료" : "거래 완료";
                }
            },
            error: function (xhr, status, error) {
                console.error("거래 상태 불러오기 실패:", status, error);
            }
        });
    }

    // 거래 완료 버튼 클릭 이벤트 (판매자와 구매자 역할에 따라 다르게 처리)
    completeTransactionBtn.addEventListener('click', function () {
        const isBuyer = completeTransactionBtn.textContent.includes("거래");
        const isSeller = completeTransactionBtn.textContent.includes("판매");

        let data = {};
        if (isSeller) {
            data = { is_completed: !transactionCompleted };  // 판매자가 완료/취소 시 is_completed 업데이트
        } else if (isBuyer) {
            data = { is_sold: !transactionCompleted };  // 구매자가 완료/취소 시 is_sold 업데이트
        }

        $.ajax({
            url: transactionStatusUrl,
            type: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(data),
            success: function (response) {
                alert(isSeller ? "판매 상태가 업데이트되었습니다." : "거래 상태가 업데이트되었습니다.");
                checkTransactionStatus();
            },
            error: function (xhr, status, error) {
                console.error("거래 상태 업데이트 실패:", status, error);
                alert("거래 상태 업데이트에 실패했습니다.");
            }
        });
    });

    $('#send-message-form').on('submit', function (e) {
        e.preventDefault();
        const messageContent = $('#message-content').val().trim();

        if (messageContent === "") {
            alert("메시지를 입력하세요.");
            return;
        }

        $.ajax({
            url: apiUrl,
            type: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                content: messageContent
            }),
            success: function (response) {
                $('#message-content').val('');
                loadMessages();
            },
            error: function (xhr, status, error) {
                console.error("메시지 전송 실패:", status, error);
                alert("메시지 전송 실패. 서버 문제 또는 인증 문제일 수 있습니다.");
            }
        });
    });

    function loadMessages(initialLoad = false) {
        $.ajax({
            url: apiUrl,
            type: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function (response) {
                const chatContainer = $('#chat-messages');
                if (initialLoad) {
                    chatContainer.empty();
                }
                response.forEach(msg => {
                    const profileImgUrl = msg.sender_image ? msg.sender_image : '/static/images/default_profile.jpg';
                    const messageClass = msg.sender_username === localStorage.getItem('current_username') ? 'my-message' : '';
                    const timestamp = msg.created_at ? new Date(msg.created_at).toLocaleString('ko-KR', { hour12: false }) : "알 수 없음";

                    const messageElement = `
                        <div class="message ${messageClass}">
                            <img src="${profileImgUrl}" class="profile-img" alt="Profile">
                            <div class="content">
                                <div class="username">${msg.sender_username}</div>
                                <div class="text">${msg.content}</div>
                                <div class="time">${timestamp}</div>
                            </div>
                        </div>
                    `;
                    chatContainer.append(messageElement);
                });
                chatContainer.scrollTop(chatContainer[0].scrollHeight);
            },
            error: function (xhr, status, error) {
                console.error("메시지 목록 불러오기 실패:", status, error);
                alert("메시지 불러오기 실패. 서버 문제 또는 인증 문제일 수 있습니다.");
            }
        });
    }

    $(document).ready(function () {
        loadMessages(true);
        checkTransactionStatus();
        setInterval(function () {
            loadMessages(false);
        }, 3000);
    });
});
