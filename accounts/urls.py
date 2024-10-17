from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

app_name = "accounts"
urlpatterns = [
    # 사용자 회원가입
    path("signup/", views.UserCreateView.as_view(), name="user-signup"),
    # 토큰 갱신
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # 이메일 인증 후 사용자 계정 활성화
    path("users/activate/<pk>/<token>/", views.activate_user, name="activate_user"),
    # 사용자 로그인 및 JWT 토큰 발급
    path("login/", views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    # 사용자 로그아웃 (토큰 블랙리스트)
    path("logout/", TokenBlacklistView.as_view(), name="logout"),
    # 특정 사용자 프로필 조회 및 수정
    path("profile/<str:username>/", views.UserProfileView.as_view()),
    # 사용자 비밀번호 변경
    path("profile/<str:username>/password/", views.ChangePasswordView.as_view()),
    # 특정 사용자 팔로우 및 언팔로우
    path("follow/<str:username>/", views.FollowView.as_view(), name="follow_view"),


    # profile 관련 API 
    # 사용자가 작성한 상품 목록 API
    path('user-products/<str:username>/', views.UserProductsListView.as_view(), name='user_products'),
    # 사용자가 좋아요한 상품 목록 API
    path('likes/<str:username>/', views.LikeListForUserAPIView.as_view(), name='like_list_for_user'),
    # 사용자를 팔로우한 user 목록 API
    path("user/<str:username>/followings/", views.UserFollowingListAPIView.as_view(), name="user_followings"),
    # 사용자가 팔로우한 user 목록 API
    path("user/<str:username>/followers/", views.UserFollowerListAPIView.as_view(), name="user_followers"),
    # 사용자가 작성한 후기 목록 API
    path('user/<str:username>/reviews/', views.UserReviewListView.as_view(), name='user-reviews'),
    # 사용자의 구매 내역 목록 API
    path('user/<str:username>/purchase-history/', views.PurchaseHistoryListView.as_view(), name='user-purchase-history'),
    # 사용자가 받은 후기 목록 API (매너온도 클릭 시)
    path('user/<str:username>/received-reviews/', views.ReceivedReviewListView.as_view(), name='user-received-reviews'),


    # 프론트(화면구성) 주소
    # 회원가입 페이지
    path("signup-page/", views.SignupPageView.as_view(), name="signup-page"),
    # 로그인 페이지
    path("login-page/", views.LoginPageView.as_view(), name="login-page"),
    # 특정 사용자 프로필 페이지
    path("profile-page/<str:username>/", views.ProfileView.as_view(), name="profile"),
    # 프로필 수정 페이지
    path("profile_edit-page/<str:username>/", views.Profile_editView.as_view(), name="profile_edit"),
    # 비밀번호 변경 페이지
    path("profile/<str:username>/password-page/", views.ChangePasswordPageView.as_view(), name="change_password_page"),
    # 특정 사용자가 팔로우한 사용자 목록 페이지
    path('profile/<str:username>/followings/', views.FollowingsPageView.as_view(), name='followings-page'),
    # 특정 사용자를 팔로우한 사용자 목록 페이지
    path('profile/<str:username>/followers/', views.FollowersPageView.as_view(), name='followers-page'),
    # 사용자가 작성한 후기 목록 페이지
    path('user/<str:username>/reviews-page/', views.UserReviewListViewTemplate.as_view(), name='user-reviews-page'),
    # 사용자의 구매 내역 목록 페이지
    path('user/<str:username>/purchase-history-page/', views.PurchaseHistoryListViewTemplate.as_view(), name='user-purchase-history-page'),
    # 사용자가 받은 후기 목록 페이지 (매너온도 클릭 시)
    path('user/<str:username>/received-reviews-page/', views.ReceivedReviewListViewTemplate.as_view(), name='user-received-reviews-page'),
    # 사용자가 작성한 상품 목록 페이지
    path('user-products-page/<str:username>/', views.UserProductsListPageView.as_view(), name='user_products_page'),
    # 사용자가 좋아요한 상품 목록 페이지
    path('user/<str:username>/like-products/', views.LikeProductsPageView.as_view(), name='like-products-page'),
]