// CSRF 토큰을 가져오는 함수 추가
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // 이 쿠키가 우리가 찾는 name에 해당하는 경우
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function sample6_execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            var addr = ''; // 주소 변수
            var extraAddr = ''; // 참고항목 변수

            if (data.userSelectedType === 'R') {
                addr = data.roadAddress;
            } else {
                addr = data.jibunAddress;
            }

            if(data.userSelectedType === 'R'){
                if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                    extraAddr += data.bname;
                }
                if(data.buildingName !== '' && data.apartment === 'Y'){
                    extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                if(extraAddr !== ''){
                    extraAddr = ' (' + extraAddr + ')';
                }
                document.getElementById("sample6_extraAddress").value = extraAddr;
            } else {
                document.getElementById("sample6_extraAddress").value = '';
            }

            document.getElementById('sample6_postcode').value = data.zonecode;
            document.getElementById("sample6_address").value = addr;
            document.getElementById("sample6_detailAddress").focus();
        }
    }).open();
}

document.getElementById('signup-form').onsubmit = function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const csrfToken = getCookie('csrftoken');

    // FormData 객체를 자바스크립트 객체로 변환
    const formDataObj = {};
    formData.forEach((value, key) => {
        formDataObj[key] = value;  // 각 필드를 자바스크립트 객체에 추가
    });

    console.log("폼 데이터 객체:", formDataObj);  // 변환된 객체를 콘솔에 출력

    // 서버로 JSON 데이터 전송 (백엔드와 연동)
    fetch('/api/accounts/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // JSON 형식으로 전송
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(formDataObj),  // 자바스크립트 객체를 JSON 문자열로 변환하여 전송
    })
    .then(response => {
        console.log("서버 응답:", response);  // 응답 상태 확인
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();  // 성공적인 응답만 JSON으로 파싱
    })
    .then((data) => {
        console.log("서버로부터 받은 데이터:", data);  // 응답 데이터 확인
        if (data.message === 'success') {
            alert('회원가입이 완료되었습니다! 이메일인증을 완료하셔야 로그인이 가능합니다!!!');
        } else {
            alert('오류가 발생했습니다: ' + JSON.stringify(data));
        }
    })
    .catch(error => {
        console.error('에러 발생:', error);
        alert('오류가 발생했습니다: ' + error.message);  // 에러 메시지 출력
    });
};
