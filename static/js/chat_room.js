const FILE_SIZE_LIMIT_MB = 10; 
const MAX_PROFILE_IMAGE_SIZE = FILE_SIZE_LIMIT_MB * 1024 * 1024; // MB 단위

document.addEventListener('DOMContentLoaded', function () {
    const messageImageInput = document.getElementById('message-image');

    // 이미지 선택 시 용량 제한 확인
    if (messageImageInput) {
        messageImageInput.addEventListener('change', function () {
            const messageImage = messageImageInput.files[0];
            if (messageImage && messageImage.size > MAX_PROFILE_IMAGE_SIZE) {
                alert(`${messageImage.name} 파일 크기가 ${FILE_SIZE_LIMIT_MB}MB를 초과했습니다.`);
                // 파일 선택 초기화 (초과한 파일이 선택되지 않도록)
                messageImageInput.value = '';
            }
        });
    }})

document.addEventListener('DOMContentLoaded', function () {
    const chatContainer = document.querySelector('.chat-container');
    const productId = chatContainer ? chatContainer.getAttribute('data-product-id') : null;
    const roomId = chatContainer ? chatContainer.getAttribute('data-room-id') : null;
    const currentUser = localStorage.getItem('current_username');
    const messageInput = document.getElementById('message-content');
    const sendMessageButton = document.querySelector('#send-message-form button[type="submit"]');

    if (!productId || !roomId) {
        console.error("productId 또는 roomId를 찾을 수 없습니다. 데이터를 확인해 주세요.");
        return;
    }

    const apiUrl = `http://127.0.0.1:8000/api/products/${productId}/chatrooms/${roomId}/messages/`;
    const transactionStatusUrl = `http://127.0.0.1:8000/api/products/${productId}/chatrooms/${roomId}/transaction-status/`;
    const token = localStorage.getItem("access_token");
    let lastMessageId = null;
    let polling = false;

    const completeTransactionBtn = document.getElementById('complete-transaction-btn');
    const writeReviewBtn = document.getElementById('write-review-btn');
    let transactionStatus = { is_sold: false, is_completed: false };

    
    // 거래 상태를 확인하는 함수
    function checkTransactionStatus() {
        $.ajax({
            url: transactionStatusUrl,
            type: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            success: function (response) {
    
                const currentUser = localStorage.getItem('current_username');
    
                const isBuyer = response.buyer === currentUser;
                const isSeller = response.seller === currentUser;
                    
                // 전역 변수 transactionStatus 업데이트
                transactionStatus = response;
                
                if (isSeller) {
                    // 판매자는 리뷰 작성 버튼을 숨김
                    if (writeReviewBtn) {
                        writeReviewBtn.style.display = 'none';
                    }
                }
                else if (response.is_sold && response.is_completed && isBuyer) {
                    writeReviewBtn.disabled = false;  // 구매자만 리뷰 작성 가능
                } else {
                    writeReviewBtn.disabled = true;
                }

                writeReviewBtn.addEventListener('click', function () {
                    window.location.href = `/api/reviews/products/${productId}/create/`;
                });
    
                // 판매자와 구매자를 기준으로 버튼 텍스트 설정
                if (isSeller) {
                    completeTransactionBtn.textContent = response.is_completed ? "판매 완료 취소" : "판매 완료";
                } else if (isBuyer) {
                    completeTransactionBtn.textContent = response.is_sold ? "거래 완료 취소" : "거래 완료";
                } else {
                    alert("판매자 또는 구매자가 아닌 사용자입니다.");
                }
            },
            error: function (xhr, status, error) {
                console.error("거래 상태 불러오기 실패:", status, error);
            }
        });
        
    }

    // 거래 완료 버튼 클릭 이벤트 (판매자와 구매자 역할에 따라 다르게 처리)
    completeTransactionBtn.addEventListener('click', function () {
        const buttonText = completeTransactionBtn.textContent;    
        const isBuyer = buttonText.includes("거래");
        const isSeller = buttonText.includes("판매");
    
        // 현재 거래 상태를 기반으로 상태 반전
        let data = {};
        if (isSeller) {
            data = { is_completed: !transactionStatus.is_completed };
        } else if (isBuyer) {
            data = { is_sold: !transactionStatus.is_sold };
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
                transactionStatus = response;  // 서버 응답을 기반으로 상태 업데이트
                checkTransactionStatus();  // 상태 업데이트 후 다시 확인
            },
            error: function (xhr, status, error) {
                console.error("거래 상태 업데이트 실패:", status, error);
                alert("거래 상태 업데이트에 실패했습니다.");
            }
        });

    });

    // AJAX를 이용하여 채팅 메시지 목록 불러오기
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
                    const timestamp = msg.created_at ? new Date(msg.created_at).toLocaleString('ko-KR', { hour12: false }) : "알 수 없음";
                    
                    let imageElement = '';
                    if (msg.image) {
                        imageElement = `<img src="${msg.image}" class="message-image" alt="Image">`;
                    }

                    const messageElement = `
                        <div class="message ${messageClass}">
                            <img src="${profileImgUrl}" class="profile-img" alt="Profile">
                            <div class="content">
                                ${imageElement}
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
        sendMessage();
    });
    
    // 엔터키로 메시지 전송
    if (messageInput) {
        messageInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();  
                sendMessage();
            }
        });
    }
    
    function sendMessage() {
        const messageContent = $('#message-content').val().trim();
        const messageImage = $('#message-image')[0].files[0];
    
        if (messageContent === "" && !messageImage) {
            alert("메시지나 이미지를 입력하세요.");
            return;
        }
    
        // 이미지 파일 크기 체크
        if (messageImage && messageImage.size > MAX_PROFILE_IMAGE_SIZE) {
            alert(`${messageImage.name}파일 크기가 ${FILE_SIZE_LIMIT_MB}MB를 초과했습니다.`);
            return;
        }
    
        // FormData 객체를 사용해 메시지와 이미지를 함께 전송
        const formData = new FormData();
        formData.append('content', messageContent);
        if (messageImage) {
            formData.append('image', messageImage);
        }
    
        $.ajax({
            url: apiUrl,
            type: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                $('#message-content').val('');  // 입력 필드 초기화
                $('#message-image').val('');    // 이미지 필드 초기화
                loadMessages(false);  // 새 메시지만 갱신
            },
            error: function () {
                alert("메시지 전송 실패. 서버 문제 또는 인증 문제일 수 있습니다.");
            }
        });
    }
    

    // 페이지 로드 시 초기 메시지 목록을 불러옴
    $(document).ready(function () {
        loadMessages(true);
        checkTransactionStatus();
        // 5초마다 새로운 메시지 확인 (롱 폴링 구현)
        setInterval(function () {
            loadMessages(false);
        }, 3000);
    });
});
