document.addEventListener('DOMContentLoaded', function () {
    const productId = window.location.pathname.split('/').slice(-2, -1)[0];  // URL에서 제품 ID 추출
    const apiUrl = `/api/products/${productId}/`;  // 제품 상세 정보 API URL
    const likeApiUrl = `/api/products/${productId}/like/`;  // 찜하기 API URL
    const likeButton = document.getElementById('like-button');
    const heartIcon = document.getElementById('heart-icon');
    const likesCountElement = document.getElementById('product-likes');

    // 버튼과 아이콘이 제대로 선택되는지 확인
    if (!likeButton || !heartIcon) {
        console.error("likeButton 또는 heartIcon 요소를 찾을 수 없습니다.");
        return;
    }

    console.log("likeButton 요소 찾음:", likeButton);
    


    // 1. 제품 상세 정보 가져오기 (기존 fetch 사용)
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

            // 작성자와 현재 로그인한 유저의 닉네임이 같으면 찜하기 버튼 숨기기
            const currentUserNickname = localStorage.getItem('current_username');  // 사용자 닉네임을 로컬 스토리지에서 가져오기
            console.log("author:",data.author)
            console.log("currentUserNickname:",currentUserNickname)
            if (currentUserNickname && currentUserNickname.trim() === data.author.trim()) {
                likeButton.style.display = 'none';
                console.log("작성자와 사용자 동일, 찜 버튼 숨김");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('제품 정보를 불러오는 데 실패했습니다.');
        });

    // 2. 찜 상태 확인 및 하트 아이콘 초기화 (로그인한 유저만)
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
        fetchWithAuth(likeApiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(likeData => {
                if (likeData.is_liked) {
                    console.log("찜한 상태입니다.");  // 확인용 로그
                    heartIcon.classList.remove('bi-suit-heart');
                    heartIcon.classList.add('bi-suit-heart-fill', 'liked');  // 이미 찜한 상태면 채워진 하트로 변경
                }
            })
            .catch(error => console.error('Error fetching like status:', error));
    }

    // 3. 찜하기 기능 처리
    likeButton.addEventListener('click', function () {
        console.log("찜하기 버튼 클릭됨");  // 이 로그가 출력되는지 확인

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
                    heartIcon.classList.add('bi-suit-heart-fill', 'liked');  // 찜하기 성공 시 채워진 하트로 변경
                    likesCountElement.textContent = currentLikesCount + 1;  // 찜수 증가
                } else if (data.message === "찜하기 취소했습니다.") {
                    heartIcon.classList.remove('bi-suit-heart-fill', 'liked');
                    heartIcon.classList.add('bi-suit-heart');  // 찜하기 취소 시 빈 하트로 변경
                    likesCountElement.textContent = currentLikesCount - 1;  // 찜수 감소
                }
            })
            .catch(error => console.error('Error:', error));
    });
});
