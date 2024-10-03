document.getElementById('login-form').onsubmit = function(event) {
    event.preventDefault();
    
    // 사용자 입력 값 가져오기
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 서버에 보낼 데이터 구성
    const loginData = {
        username: username,
        password: password
    };

    // 로그인 요청을 보낼 URL을 /api/accounts/login/으로 변경
    fetch('/api/accounts/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            alert('로그인 완료');
            localStorage.setItem('access_token', data.access);  // 토큰을 로컬 스토리지에 저장
            window.location.href = '/api/home/';  // 로그인 후 프로필 페이지로 이동
        } else {
            document.getElementById('message').innerText = '로그인 실패: ' + ('아이디나 비밀번호를 확인해주세요.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').innerText = '로그인 중 오류가 발생했습니다.';
    });
};
