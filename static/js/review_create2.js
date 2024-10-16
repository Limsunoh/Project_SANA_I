document.addEventListener('DOMContentLoaded', function () {
    const reviewForm = document.getElementById('review-form');
    const checklist = document.querySelectorAll('.form-check-input');  // 체크박스들 선택
    const additionalComments = document.getElementById('additional-comments');

    reviewForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // 체크된 체크박스 항목들을 배열로 수집
        const selectedChecklist = Array.from(checklist)
            .filter(checkbox => checkbox.checked)  // 체크된 것만 필터링
            .map(checkbox => checkbox.value);      // 체크된 것들의 값을 배열로 변환

        const comments = additionalComments.value.trim();

        // 리뷰 데이터 객체 생성
        const reviewData = {
            checklist: selectedChecklist,
            additional_comments: comments
        };

        // URL에서 productId 추출 (예: /reviews/products/94/에서 94 추출)
        const productId = window.location.pathname.split('/').filter(part => part).pop();
        
        // 리뷰 작성 API 경로
        const reviewApiUrl = `http://127.0.0.1:8000/api/reviews/products/${productId}/`;
        const token = localStorage.getItem('access_token');

        // Fetch API로 POST 요청
        fetch(reviewApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('리뷰 작성에 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            alert('리뷰가 성공적으로 작성되었습니다.');
            window.location.reload();  // 리뷰 작성 후 페이지 새로고침
        })
        .catch(error => {
            console.error(error);
            alert('리뷰 작성 중 문제가 발생했습니다.');
        });
    });
});
