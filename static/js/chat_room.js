document.addEventListener('DOMContentLoaded', function () {
    const chatContainer = document.querySelector('.chat-container');
    const productId = chatContainer ? chatContainer.getAttribute('data-product-id') : null;
    const roomId = chatContainer ? chatContainer.getAttribute('data-room-id') : null;

    if (!productId || !roomId) {
        console.error("productId 또는 roomId를 찾을 수 없습니다. 데이터를 확인해 주세요.");
        return;
    }

    const apiUrl = `http://127.0.0.1:8000/api/products/${productId}/chatrooms/${roomId}/messages/`;
    const token = localStorage.getItem("access_token");
    let lastMessageId = null;
    let polling = false;

    function loadMessages(initialLoad = false) {
        if (polling) return;

        polling = true;
        let requestUrl = apiUrl;
        if (!initialLoad && lastMessageId) {
            requestUrl += `?last_message_id=${lastMessageId}`;
        }

        $.ajax({
            url: requestUrl,
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
                    const timestamp = new Date(msg.created_at).toLocaleString('ko-KR', { hour12: false });

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
                if (response.length > 0) {
                    lastMessageId = response[response.length - 1].id;
                }
                polling = false;
            },
            error: function (xhr, status, error) {
                alert("메시지 불러오기 실패. 서버 문제 또는 인증 문제일 수 있습니다.");
                polling = false;
            }
        });
    }

    // 메시지 전송 폼 처리
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
            success: function () {
                $('#message-content').val('');
                loadMessages(false);
            },
            error: function () {
                alert("메시지 전송 실패. 서버 문제 또는 인증 문제일 수 있습니다.");
            }
        });
    });

    // 리뷰 요청 버튼 클릭 시
    $('#request-review-btn').on('click', function () {
        $.ajax({
            url: `/api/chat/${roomId}/request-review/`,
            type: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function () {
                alert("리뷰 요청을 보냈습니다.");
            },
            error: function () {
                alert("리뷰 요청 중 오류가 발생했습니다.");
            }
        });
    });

    // 리뷰 작성 버튼 클릭 시
    $('#write-review-btn').on('click', function () {
        window.location.href = `/products/${productId}/write-review/`;
    });

    // 초기 메시지 로드
    loadMessages(true);
    setInterval(function () {
        loadMessages(false);
    }, 2000);
});
