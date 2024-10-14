document.addEventListener('DOMContentLoaded', function () {
    // 채팅방 목록 불러오기
    loadChatRooms();
});

async function loadChatRooms() {
    const username = localStorage.getItem("current_username");
    console.log("username:",username)

    try {
        const response = await fetchWithAuth(`/api/products/chatrooms/${username}/`);
        if (!response.ok) throw new Error("채팅방 목록을 불러오는데 실패했습니다.");
        const chatRooms = await response.json();

        displayChatRooms(chatRooms);
    } catch (error) {
        console.error("Error:", error);
        alert("채팅방 목록을 불러오지 못했습니다.");
    }
}

function displayChatRooms(chatRooms) {
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
        console.log(`Product id: ${room.product_id}, Room ID: ${room.id}`);
        roomElement.innerHTML = `
            <strong>${room.product_title}</strong> - 판매자: ${room.seller_username}, 구매자: ${room.buyer_username}
            <a href="/api/products/${room.product_id}/chatrooms/${room.id}/">채팅방으로 이동</a>
        `;
        chatRoomItems.appendChild(roomElement);
    });
}
