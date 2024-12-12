document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("username");
    const nicknameInput = document.getElementById("nickname");
    const nameInput = document.getElementById("name");
    const postcodeInput = document.getElementById("postcode");
    const mainAddressInput = document.getElementById("mainaddress");
    const subAddressInput = document.getElementById("subaddress");
    const extraAddressInput = document.getElementById("extraaddress");
    const birthInput = document.getElementById("birth");
    const emailInput = document.getElementById("email");
    const imageInput = document.getElementById("image");
    const profileImagePreview = document.getElementById("profile_image_preview");
    const removeProfileImageButton = document.getElementById("remove-profile-image"); //프로필이미지 삭제버튼 추가
    const introduceInput = document.getElementById("introduce"); // introduce 요소 추가

    const FILE_SIZE_LIMIT_MB = 10;
    const MAX_PROFILE_IMAGE_SIZE = FILE_SIZE_LIMIT_MB * 1024 * 1024; // MB 단위
    let removeProfileImage = false;  // 프로필 이미지 삭제 여부 플래그

    // 현재 로그인된 사용자의 아이디 불러오기
    let username = localStorage.getItem("current_username");
    let accessToken = localStorage.getItem("access_token");

    if (removeProfileImageButton) {
        console.log("Remove Profile Image Button Found");
    } else {
        console.log("Remove Profile Image Button Not Found");
    }
    // 이미지 삭제 버튼 클릭 이벤트
    removeProfileImageButton.addEventListener("click", function () {
        profileImagePreview.src = "/static/images/default_image.jpg";  // 기본 이미지로 변경
        removeProfileImage = true;  // 이미지 삭제 플래그 설정
        imageInput.value = "";  // 파일 선택 초기화
        alert("프로필 이미지가 삭제되었습니다.");  // 알림 메시지 띄우기
    });

    if (!username) {
        if (accessToken) {
            // 서버에서 사용자 정보 요청하여 username 설정
            fetch("/api/accounts/profile/", {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                username = data.username;
                localStorage.setItem("current_username", username);
                location.reload();  // 페이지를 새로고침하여 username 반영
            })
            .catch(error => {
                console.error("사용자 정보를 가져오는 중 오류 발생:", error);
                alert("로그인된 사용자의 정보를 찾을 수 없습니다.");
                window.location.href = "/accounts/login-page/";
            });
        } else {
            alert("로그인된 사용자의 정보를 찾을 수 없습니다. 로그인 페이지로 이동합니다.");
            window.location.href = "/accounts/login-page/";
            return;
        }
    }

    // usernameInput을 비활성화하여 표시만 되도록 설정
    usernameInput.textContent = username;  // 아이디를 표시만 하도록 설정 (수정 불가)

    // 우편번호 찾기 버튼 클릭 이벤트
    document.getElementById("address-search-btn").addEventListener("click", function () {
        new daum.Postcode({
            oncomplete: function (data) {
                postcodeInput.value = data.zonecode; // 우편번호 설정
                mainAddressInput.value = data.address; // 기본 주소 설정
                extraAddressInput.value = data.buildingName; // 참고 주소 설정
            }
        }).open();
    });

    // 이미지 미리보기 업데이트 및 용량 체크
    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];
        if (file) {
            // 용량 체크
            if (file.size > MAX_PROFILE_IMAGE_SIZE) {
                alert(`프로필 사진 용량은 ${FILE_SIZE_LIMIT_MB}MB 이하로 제한됩니다.`);
                imageInput.value = ""; // 파일 선택 초기화
                profileImagePreview.src = "/static/images/default_image.jpg"; // 기본 이미지로 설정
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImagePreview.src = e.target.result;
                removeProfileImage = false; // 이미지 업로드 시 삭제 플래그 해제
            };
            reader.readAsDataURL(file);
        }
    });

    // 프로필 저장 버튼 클릭 이벤트
    document.getElementById("save-btn").addEventListener("click", async function () {
        const formData = new FormData();
        formData.append("nickname", nicknameInput.value);
        formData.append("name", nameInput.value);
        formData.append("postcode", postcodeInput.value);
        formData.append("mainaddress", mainAddressInput.value);
        formData.append("subaddress", subAddressInput.value);
        formData.append("extraaddress", extraAddressInput.value);
        formData.append("birth", birthInput.value);
        formData.append("email", emailInput.value);
        formData.append('introduce', introduceInput.value);

        // formData에 값이 제대로 추가되었는지 확인
        for (var pair of formData.entries()) {
            console.log(pair[0]+ ': ' + pair[1]);
        }

        // 이미지 파일 또는 이미지 삭제 플래그 전송
        if (removeProfileImage) {
            formData.append("remove_image", true);  // 이미지 삭제 플래그 전송
        } else if (imageInput.files[0]) {
            formData.append("image", imageInput.files[0]);  // 새로운 이미지 파일 전송
            console.log("Image added to formData:", imageInput.files[0]);
        }

        const response = await fetch(`/api/accounts/profile/${username}/`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            body: formData,
        });

        if (response.ok) {
            alert("프로필이 성공적으로 수정되었습니다.");
            // 프로필 페이지로 리다이렉트
            window.location.href = `/accounts/profile-page/${username}/`;
        } else {
            const errorData = await response.json();
            alert(`프로필 수정에 실패했습니다: ${errorData.detail}`);
        }
    });

    // 기존 프로필 데이터를 불러오는 함수
    async function loadProfileData() {
        const profileUrl = `/api/accounts/profile/${username}/`;

        try {
            const response = await fetchWithAuth(profileUrl);
            console.log("Response Status:", response.status); // 응답 상태 코드 확인

            if (response.ok) {
                const data = await response.json();
                console.log("Profile Data:", data); // 프로필 데이터 출력

                // HTML 요소에 데이터 반영
                nicknameInput.value = data.nickname || "";
                nameInput.value = data.name || "";
                postcodeInput.value = data.postcode || "";
                mainAddressInput.value = data.mainaddress || "";
                subAddressInput.value = data.subaddress || "";
                extraAddressInput.value = data.extraaddress || "";
                birthInput.value = data.birth || "";
                emailInput.value = data.email || "";
                introduceInput.value = data.introduce || "";
                profileImagePreview.src = data.profile_image || "/static/images/default_image.jpg"; // 이미지 미리보기 설정
            } else {
                console.error("프로필 정보를 불러오는 데 실패했습니다:", await response.json());
                alert("프로필 정보를 불러올 수 없습니다.");
            }
        } catch (error) {
            console.error("프로필 불러오기 중 오류 발생:", error);
            alert("프로필 정보를 불러오는 중 문제가 발생했습니다.");
        }
    }

    // 페이지 로드 시 프로필 데이터 불러오기
    loadProfileData();
});
