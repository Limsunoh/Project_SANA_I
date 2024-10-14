document.addEventListener('DOMContentLoaded', function () {
    const productId = window.location.pathname.split('/').slice(-2, -1)[0];  // URL에서 제품 ID 추출
    const apiUrl = `/api/products/${productId}/`;  // 제품 상세 정보 API URL
    const likeApiUrl = `/api/products/${productId}/like/`;  // 찜하기 API URL
    const chatRoomApiUrl = `/api/products/${productId}/chatrooms/`;  // 채팅방 생성 API URL
    const chatButton = document.getElementById('chat-button');
    const likeButton = document.getElementById('like-button');
    const heartIcon = document.getElementById('heart-icon');
    const likesCountElement = document.getElementById('product-likes');
    const authorProfileImg = document.getElementById('author-profile-img');  // 작성자 프로필 이미지 요소
    const authorLinks = document.querySelectorAll('.author-link');  // 작성자 프로필 이미지 및 작성자 이름 링크

    const editButton = document.getElementById('edit-button');  // 수정 버튼
    const deleteButton = document.getElementById('delete-button');  // 삭제 버튼
    const confirmDeleteButton = document.getElementById('confirm-delete');  // 모달 내 삭제 버튼

    // 모달 요소
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));

    // 버튼과 아이콘이 제대로 선택되는지 확인
    if (!likeButton || !heartIcon) {
        console.error("likeButton 또는 heartIcon 요소를 찾을 수 없습니다.");
        return;
    }

    console.log("likeButton 요소 찾음:", likeButton);

    // 1. 제품 상세 정보 가져오기
    // 제품 상세 정보 가져오기
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            return response.json();
        })
        .then(data => {
            // 제품 상세 정보 렌더링
            document.getElementById('product-title').textContent = data.title;
            document.getElementById('product-author').textContent = data.author;

            if (data.author_profile_image_url) {
                authorProfileImg.src = data.author_profile_image_url;  // 작성자 프로필 이미지 설정
            } else {
                authorProfileImg.src = '{% static "images/default_profile.jpg" %}';
            }

            const mainaddress = data.mainaddress;
            const shortenedAddress = mainaddress.split(" ").slice(0, 2).join(" ");
            document.getElementById('product-location').textContent = shortenedAddress || '지역명 없음';
            document.getElementById('product-status').textContent = data.status || '상태 정보 없음';
            document.getElementById('product-price').textContent = `${data.price}원`;
            document.getElementById('product-hits').textContent = `${data.hits}`;
            document.getElementById('product-likes').textContent = `${data.likes_count}`;
            document.getElementById('product-description').textContent = data.content;

            const imageGallery = document.getElementById('image-gallery');
            data.images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = image.image_url;
                imgElement.alt = data.title;
                imgElement.classList.add('product-image');
                imageGallery.appendChild(imgElement);
            });

            const hashtagContainer = document.getElementById('hashtags');
            data.hashtag.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.textContent = `#${tag.name}`;
                tagElement.classList.add('hashtag');
                hashtagContainer.appendChild(tagElement);
            });

            // 작성자와 현재 로그인한 유저의 닉네임이 같으면 찜하기, 채팅하기 버튼 숨기기
            const currentUserNickname = localStorage.getItem('current_username');
            if (currentUserNickname && currentUserNickname.trim() === data.author.trim()) {
                likeButton.style.display = 'none';
                chatButton.style.display = 'none';
            } else {
                chatButton.style.display = 'inline-block'; // 작성자가 아닌 경우에만 채팅 버튼 표시
            }

            // 작성자 프로필 링크에 데이터 추가 및 클릭 이벤트 설정
            authorLinks.forEach(function (link) {
                link.dataset.author = data.author;
                link.addEventListener("click", function (event) {
                    event.preventDefault();  // 기본 링크 동작 방지
                    const authorUsername = link.dataset.author;

                    if (authorUsername) {
                        // 작성자 프로필 페이지로 이동
                        window.location.href = `/api/accounts/profile-page/${authorUsername}/`;
                    }
                });
            });

            // 작성자와 현재 사용자가 다를 경우 수정 및 삭제 버튼 숨기기
            if (currentUserNickname && currentUserNickname.trim() !== data.author.trim()) {
                editButton.style.display = 'none';
                deleteButton.style.display = 'none';
                console.log("작성자와 사용자가 다름, 수정/삭제 버튼 숨김");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('제품 정보를 불러오는 데 실패했습니다.');
        });

    // 채팅하기 버튼 클릭 시 채팅방 생성 및 이동
    chatButton.addEventListener('click', function () {
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            alert("로그인이 필요합니다.");
            return;
        }

        // 채팅방 생성 요청 전 채팅방 존재 여부 확인
        fetchWithAuth(chatRoomApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.status === 403) {
                throw new Error('이 채팅방에 접근할 수 있는 권한이 없습니다.');
            }
            return response.json();
        })
        .then(data => {
            if (data.id) {
                // 기존 채팅방이 있는 경우, 해당 채팅방으로 이동
                window.location.href = `/api/products/${productId}/chatrooms/${data.id}/`;
            } else {
                // 채팅방이 존재하지 않을 경우 새로 생성
                createChatRoom();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('채팅방에 접근할 수 없습니다.');
        });

        function createChatRoom() {
            fetchWithAuth(chatRoomApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                if (response.status === 400) {
                    throw new Error('이미 해당 상품에 대한 채팅방이 존재합니다.');
                }
                return response.json();
            })
            .then(data => {
                if (data.id) {
                    // 새 채팅방이 생성된 경우, 해당 채팅방으로 이동
                    window.location.href = `/api/products/${productId}/chatrooms/${data.id}/`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('이미 해당 상품에 대한 채팅방이 존재합니다.');
            });
        }
    });

    // 찜 상태 확인 및 하트 아이콘 초기화 (로그인한 유저만)
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
        fetchWithAuth(likeApiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(likeData => {
                if (likeData.is_liked) {
                    heartIcon.classList.remove('bi-suit-heart');
                    heartIcon.classList.add('bi-suit-heart-fill', 'liked');
                }
            })
            .catch(error => console.error('Error fetching like status:', error));
    }

    // 찜하기 기능 처리
    likeButton.addEventListener('click', function () {
        if (!accessToken) {
            alert("로그인이 필요합니다.");
            return;
        }

        fetchWithAuth(likeApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
            .then(response => response.json())
            .then(data => {
                let currentLikesCount = parseInt(likesCountElement.textContent);

                if (data.message === "찜하기 했습니다.") {
                    heartIcon.classList.remove('bi-suit-heart');
                    heartIcon.classList.add('bi-suit-heart-fill', 'liked');
                    likesCountElement.textContent = currentLikesCount + 1;
                } else if (data.message === "찜하기 취소했습니다.") {
                    heartIcon.classList.remove('bi-suit-heart-fill', 'liked');
                    heartIcon.classList.add('bi-suit-heart');
                    likesCountElement.textContent = currentLikesCount - 1;
                }
            })
            .catch(error => console.error('Error:', error));
    });

    // 4. 게시글 수정 페이지로 이동
    editButton.addEventListener('click', function () {
        window.location.href = `/api/products/edit-page/${productId}/`;  // 수정 페이지로 이동
    });

    // 5. 삭제 버튼 클릭 시 모달 띄우기
    deleteButton.addEventListener('click', function () {
        deleteModal.show();
    });

    // 6. 삭제 확인 버튼 클릭 시 삭제 요청
    confirmDeleteButton.addEventListener('click', async function () {
        try {
            const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

            const response = await fetch(`/api/products/${productId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                // 삭제 성공 시 홈 페이지로 이동
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                console.error('삭제 중 에러 발생:', errorData);
            }
        } catch (error) {
            console.error('서버 통신 중 에러 발생:', error);
        }
    });
});
