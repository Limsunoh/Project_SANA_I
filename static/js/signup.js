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

document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const checkPasswordInput = document.getElementById('check_password');
    const passwordError = document.getElementById('password-error');
    const checkPasswordError = document.getElementById('checkpassword-error');

    // 비밀번호 입력 시 검증
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;

        // 비밀번호가 입력된 경우에만 검증 결과에 따른 메시지 표시
        if (password.length > 0) {
            const errorMessages = validatePassword(password);
            if (errorMessages.length > 0) {
                passwordError.style.display = 'block';
                passwordError.innerText = errorMessages.join("\n");  // 여러 에러 메시지를 개행으로 구분하여 표시
            } else {
                passwordError.style.display = 'none';
            }
        } else {
            // 비밀번호 입력란이 비어있는 경우 메시지 숨김
            passwordError.style.display = 'none';
        }

        // 비밀번호 확인 필드와 비교
        validatePasswordMatch();
    });

    // 비밀번호 확인 필드 입력 시 검증
    checkPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });

    function validatePassword(password) {
        const errors = [];

        // 1. 비밀번호 최소 길이 (8자 이상)
        if (password.length < 8) {
            errors.push("비밀번호가 너무 짧습니다. 최소 8 문자를 포함해야 합니다.");
        }

        // 2. 너무 일상적인 비밀번호인지 확인 (예시로 'password'와 같은 단어를 필터링)
        const commonPasswords = ['password', '12345678', 'qwerty'];
        if (commonPasswords.includes(password.toLowerCase())) {
            errors.push("비밀번호가 너무 일상적인 단어입니다.");
        }

        // 3. 비밀번호가 숫자로만 이루어졌는지 확인
        if (/^\d+$/.test(password)) {
            errors.push("비밀번호가 전부 숫자로 되어 있습니다.");
        }

        return errors;
    }

    // 비밀번호와 확인용 비밀번호가 일치하는지 확인하는 함수
    function validatePasswordMatch() {
        const password = passwordInput.value;
        const checkPassword = checkPasswordInput.value;

        // 확인 비밀번호가 입력된 경우에만 검증
        if (checkPassword.length > 0) {
            if (password !== checkPassword) {
                checkPasswordError.style.display = 'block';
                checkPasswordError.innerText = "비밀번호가 일치하지 않습니다.";
            } else {
                checkPasswordError.style.display = 'none';
            }
        } else {
            checkPasswordError.style.display = 'none';  // 입력이 없으면 메시지 숨김
        }
    }
});

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
    
        // 에러 메시지를 필드별로 정리
        let errorMessage = "회원가입 실패:\n";
        if (errorData.postcode) {
            errorMessage += " - 우편번호는 필수 항목입니다.\n";
        }
        if (errorData.mainaddress) {
            errorMessage += " - 주소는 필수 항목입니다.\n";
        }
        if (errorData.subaddress) {
            errorMessage += " - 상세 주소는 필수 항목입니다.\n";
        }
        alert(errorMessage);
    }
};

