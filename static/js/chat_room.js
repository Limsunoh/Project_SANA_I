document.addEventListener('DOMContentLoaded', function () {
    // chat-container 요소를 올바르게 선택하도록 수정합니다.
    const chatContainer = document.querySelector('.chat-container');
    const productId = chatContainer ? chatContainer.getAttribute('data-product-id') : null;
    const roomId = chatContainer ? chatContainer.getAttribute('data-room-id') : null;

    // 오류 확인 및 경고 메시지 추가
    if (!productId || !roomId) {
        console.error("productId 또는 roomId를 찾을 수 없습니다. 데이터를 확인해 주세요.");
        return;
    }

    // 전역 변수 설정
    const apiUrl = `http://127.0.0.1:8000/api/products/${productId}/chatrooms/${roomId}/messages/`;
    const token = localStorage.getItem("access_token");
    let lastMessageId = null;
    let polling = false;

    // AJAX를 이용하여 채팅 메시지 목록 불러오기
    function loadMessages(initialLoad = false) {
        if (polling) {
            // 이미 요청이 진행 중이라면 중복된 요청을 보내지 않도록 합니다.
            return;
        }

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
                    // 프로필 이미지 URL 처리
                    const profileImgUrl = msg.sender_image ? msg.sender_image : '/static/images/default_profile.jpg';
                    const messageClass = msg.sender_username === localStorage.getItem('current_username') ? 'my-message' : '';
                    const timestamp = msg.created_at ? new Date(msg.created_at).toLocaleString('ko-KR', { hour12: false }) : "알 수 없음";
                    
                    console.log("Profile Image URL:", msg.sender_image);
                    console.log("Timestamp:", msg.created_at);

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

                // 마지막 메시지 ID 업데이트
                if (response.length > 0) {
                    lastMessageId = response[response.length - 1].id;
                    console.log("업데이트된 lastMessageId:", lastMessageId);
                }

                polling = false;
            },
            error: function (xhr, status, error) {
                console.error("메시지 목록 불러오기 실패:", status, error);
                alert("메시지 불러오기 실패. 서버 문제 또는 인증 문제일 수 있습니다.");
                polling = false;
            }
        });
    }

    // 폼 제출 시 AJAX를 사용하여 메시지 전송
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
                loadMessages(false);  // 새 메시지만 갱신
            },
            error: function (xhr, status, error) {
                console.error("메시지 전송 실패:", status, error);
                alert("메시지 전송 실패. 서버 문제 또는 인증 문제일 수 있습니다.");
            }
        });
    });

    // 페이지 로드 시 초기 메시지 목록을 불러옴
    $(document).ready(function () {
        loadMessages(true);
        // 2초마다 새로운 메시지 확인 (롱 폴링 구현)
        setInterval(function () {
            loadMessages(false);
        }, 2000);
    });
});