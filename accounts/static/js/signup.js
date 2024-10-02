// 이메일 인증 버튼 클릭 시
document.getElementById('verify-email').addEventListener('click', function() {
    const email = document.getElementById('id_email').value;

    fetch('/api/email-verify/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error:', error));
});

// 회원가입 폼 제출 시
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('id_username').value,
        password: document.getElementById('id_password').value,
        checkpassword: document.getElementById('id_checkpassword').value,
        nickname: document.getElementById('id_nickname').value,
        name: document.getElementById('id_name').value,
        email: document.getElementById('id_email').value,
    };

    fetch('/api/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            alert('회원가입 성공!');
            window.location.href = '/login/';
        } else {
            alert('회원가입 실패: ' + JSON.stringify(data));
        }
    })
    .catch(error => console.error('Error:', error));
});
