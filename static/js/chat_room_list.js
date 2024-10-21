document.addEventListener('DOMContentLoaded', function () {
    // 채팅방 목록 불러오기
    loadChatRooms();
    updateChatAlertBadge(); // 새 메시지 확인

    // 10초마다 새 메시지 확인
    setInterval(updateChatAlertBadge, 10000);
});

async function loadChatRooms() {
    const username = localStorage.getItem("current_username");

    try {
        const response = await fetchWithAuth(`/api/products/chatrooms/${username}/`);
        if (!response.ok) throw new Error("채팅방 목록을 불러오는데 실패했습니다.");
        const chatRooms = await response.json();

        // 새 메시지 확인을 위해 추가 요청
        const newMessagesResponse = await fetchWithAuth("/api/products/chatroom/new_messages/");
        if (!newMessagesResponse.ok) throw new Error("새 메시지 확인 실패");

        // 새 메시지가 없을 경우 빈 배열로 기본값 설정
        const newMessagesData = await newMessagesResponse.json();
        const newMessages = newMessagesData.new_messages || [];

        // 디버그용 로그 출력 (newMessages 데이터 확인)
        console.log("새 메시지 데이터:", newMessages);

        displayChatRooms(chatRooms, newMessages); // 새 메시지 데이터를 함께 전달
    } catch (error) {
        console.error("Error:", error);
        alert("채팅방 목록을 불러오지 못했습니다.");
    }
}

function displayChatRooms(chatRooms, newMessages = []) {
    const chatRoomItems = document.getElementById('chat-room-items');

    // 기존 목록 초기화
    chatRoomItems.innerHTML = "";

    // 채팅방이 없을 때 처리
    if (chatRooms.length === 0) {
        const noChatElement = document.createElement('li');
        noChatElement.textContent = "참여 중인 채팅방이 없습니다.";
        chatRoomItems.appendChild(noChatElement);
        return;
    }

    // 채팅방 목록 생성
    chatRooms.forEach(room => {
        const roomElement = document.createElement('li');
        let newMessageBadge = '';
    
        // 새 메시지 배지
        const newMessage = newMessages.find(msg => msg.room_id === room.id);
        if (newMessage && newMessage.unread_count > 0) {
            newMessageBadge = `<span class="badge bg-danger">${newMessage.unread_count}개의 새 메시지</span>`;
        }
    
        // 채팅방 항목 HTML 구조
        roomElement.innerHTML = `
            <div class="chat-room-item">
                <div class="product-title">${newMessageBadge}${room.product_title}</div>
                <div class="user-info">판매자: ${room.seller_username}, 구매자: ${room.buyer_username}</div>
                <div class="chat-room-actions">
                    <a href="/api/products/${room.product_id}/chatrooms/${room.id}/" class="chat-link">채팅방으로 이동</a>
                    <button class="leave-chatroom-btn" data-room-id="${room.id}">채팅방 나가기</button>
                </div>
            </div>
        `;
        chatRoomItems.appendChild(roomElement);
    });

    // '채팅방 나가기' 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.leave-chatroom-btn').forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.dataset.roomId;
            leaveChatRoom(roomId);
        });
    });
}

// 채팅방 나가기 API 호출 함수
async function leaveChatRoom(roomId) {
    try {
        const response = await fetch(`/api/products/chatroom/${roomId}/leave/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,  // 필요시 토큰을 포함해 요청
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert('채팅방에서 나갔습니다.');
            // 성공적으로 나가면 채팅방 목록을 다시 로드
            loadChatRooms();
        } else {
            const errorData = await response.json();
            alert(`채팅방 나가기 실패: ${errorData.detail}`);
        }
    } catch (error) {
        console.error('채팅방 나가기 중 오류 발생:', error);
        alert('채팅방 나가기 중 오류가 발생했습니다.');
    }
}

// 새 메시지 알림 함수 추가
async function updateChatAlertBadge() {
    try {
        const response = await fetchWithAuth("/api/products/chatroom/new_messages/");
        if (!response.ok) throw new Error("새 메시지 확인 실패");

        const data = await response.json();
        const newMessagesCount = data.new_messages_count;

        const chatLink = document.getElementById("chat-link");

        if (newMessagesCount > 0) {
            chatLink.classList.add("new-message-alert");
            chatLink.innerHTML = `내 채팅방 <span class="badge bg-danger">${newMessagesCount}</span>`;
        } else {
            chatLink.classList.remove("new-message-alert");
            chatLink.innerHTML = "내 채팅방";
        }
    } catch (error) {
        console.error("새 메시지 확인 실패:", error);
    }
}
