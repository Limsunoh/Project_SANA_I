const FileSizeNum = 10; 
const MAX_PROFILE_IMAGE_SIZE = FileSizeNum * 1024 * 1024; // MB 단위
const profileImageInput = document.getElementById('profile-image-input');

// 이미지 유무 확인
if (profileImageInput) {
    // 파일 선택 시 용량 체크
    profileImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file && !checkProfileImageSize(file)) {
            // 용량 초과 시 파일 선택 초기화
            event.target.value = ''; 
        }
    });
} else {
    console.error("Element not found: profile-image-input");
}

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

// 프로필 사진 용량 체크
function checkProfileImageSize(file) {
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
        alert(`${file.name} 파일의 크기가 ${FileSizeNum}MB를 초과했습니다.\n 용량을 확인해주세요.`);
        return false;
    }
    return true;
}

// 회원가입 폼 전송 이벤트 핸들러
document.getElementById('signup-form').onsubmit = async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    
    // 프로필 사진 파일 가져오기
    const profileImage = profileImageInput ? profileImageInput.files[0] : null; 
    if (profileImage && !checkProfileImageSize(profileImage)) {
        return; // 용량 초과 시, 폼 제출 중단
    }

    const response = await fetch('/api/accounts/signup/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: formData,
    });

    if (response.ok) {
        alert('회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.');
        window.location.href = '/api/accounts/login-page/';  // 가입 후, 로그인 페이지로 이동
    } else {
        const errorData = await response.json();
        alert('회원가입 실패: ' + JSON.stringify(errorData));
    }
};
