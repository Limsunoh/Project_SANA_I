document.addEventListener('DOMContentLoaded', function () {
    const profileUsername = document.getElementById('profile-username').dataset.username;
    loadFollowingList(profileUsername);
});

async function loadFollowingList(username) {
    const followingsListContainer = document.getElementById('followings-list');

    showLoading(); // 로딩 표시

    try {
        const response = await fetch(`/api/accounts/user/${username}/followings/`, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error('팔로우 목록을 불러오는데 실패했습니다.');
        }

        const followings = await response.json();
        followingsListContainer.innerHTML = '';

        followings.forEach(user => {
            const userCard = `
                <div class="card m-2" style="width: 18rem;">
                    <img src="${user.profile_image}" class="card-img-top" alt="${user.username}">
                    <div class="card-body">
                        <h5 class="card-title">${user.nickname} (@${user.username})</h5>
                        <a href="/accounts/profile-page/${user.username}/" class="btn btn-primary">프로필 보기</a>
                    </div>
                </div>
            `;
            followingsListContainer.insertAdjacentHTML("beforeend", userCard);
        });

        if (followings.length === 0) {
            followingsListContainer.innerHTML = "<p>팔로우한 사용자가 없습니다.</p>";
        }

    } catch (error) {
        console.error('에러 발생:', error);
        followingsListContainer.innerHTML = "<p>팔로우 목록을 불러올 수 없습니다.</p>";
    } finally {
        hideLoading(); // 로딩 숨기기
    }
}
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
