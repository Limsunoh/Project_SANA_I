document.addEventListener('DOMContentLoaded', function () {
    const productId = window.location.pathname.split('/').slice(-2, -1)[0];  // URL에서 제품 ID 추출
    const apiUrl = `/api/products/${productId}/`;  // 제품 상세 정보 API URL
    const likeApiUrl = `/api/products/${productId}/like/`;  // 찜하기 API URL
    const likeButton = document.getElementById('like-button');
    const heartIcon = document.getElementById('heart-icon');

    // 1. 제품 상세 정보 가져오기
    fetch(apiUrl)
        .then(response => {
            console.log(response);  // 응답 상태를 출력하여 확인
            if (!response.ok) {  // 응답 상태가 OK(200)인지 확인
                throw new Error('Failed to fetch product details');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);  // 응답 데이터를 확인하여 올바른지 체크
            // 데이터를 사용한 제품 상세 정보 렌더링
            document.getElementById('product-title').textContent = data.title;
            document.getElementById('product-author').textContent = data.author;

            // 지역명 처리: 두 번째 공백 전까지만 표시
            const mainaddress = data.mainaddress;
            const shortenedAddress = mainaddress.split(" ").slice(0, 2).join(" ");  // 첫 두 단어만 가져옴
            document.getElementById('product-location').textContent = shortenedAddress || '지역명 없음';
            document.getElementById('product-status').textContent = data.status || '상태 정보 없음';
            document.getElementById('product-price').textContent = `${data.price}원`;
            document.getElementById('product-hits').textContent = `${data.hits}`;
            document.getElementById('product-likes').textContent = `${data.likes_count}`;
            document.getElementById('product-description').textContent = data.content;

            // 이미지 갤러리 렌더링
            const imageGallery = document.getElementById('image-gallery');
            data.images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = image.image_url;
                imgElement.alt = data.title;
                imgElement.classList.add('product-image');
                imageGallery.appendChild(imgElement);
            });

            // 해시태그 렌더링
            const hashtagContainer = document.getElementById('hashtags');
            data.hashtag.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.textContent = `#${tag.name}`;
                tagElement.classList.add('hashtag');
                hashtagContainer.appendChild(tagElement);
            });
        })
        .catch(error => {
            console.error('Error:', error);  // 에러 메시지를 콘솔에 출력
            alert('제품 정보를 불러오는 데 실패했습니다.');
        });

    // 2. 찜 상태 확인 및 하트 아이콘 초기화
    fetch(likeApiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // 토큰 사용
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.is_liked) {
            heartIcon.classList.add('liked');  // 이미 찜한 상태면 채워진 하트로 변경
        }
    })
    .catch(error => {
        console.error('Error fetching like status:', error);
    });

    // 3. 하트 클릭 시 찜하기 기능 처리
    likeButton.addEventListener('click', function () {
        fetch(likeApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,  // 토큰 사용
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "찜하기 했습니다.") {
                heartIcon.classList.add('liked');  // 찜하기 성공 시 채워진 하트로 변경
            } else if (data.message === "찜하기 취소했습니다.") {
                heartIcon.classList.remove('liked');  // 찜하기 취소 시 빈 하트로 변경
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
