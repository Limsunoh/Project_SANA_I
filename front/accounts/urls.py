from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

from . import views


urlpatterns = [
    path("signup-page/", views.SignupPageView.as_view(), name="signup-page"),
    path("login-page/", views.LoginPageView.as_view(), name="login-page"),
    path("profile-page/<str:username>/", views.ProfileView.as_view(), name="profile"),
    path("profile_edit-page/<str:username>/", views.Profile_editView.as_view(), name="profile_edit"),
    path("profile/<str:username>/password-page/", views.ChangePasswordPageView.as_view(), name="change_password_page"),
    path("profile/<str:username>/followings/", views.FollowingsPageView.as_view(), name="followings-page"),
    path("profile/<str:username>/followers/", views.FollowersPageView.as_view(), name="followers-page"),
    path("user/<str:username>/reviews-page/", views.UserReviewListViewTemplate.as_view(), name="user-reviews-page"),
    path(
        "user/<str:username>/purchase-history-page/",
        views.PurchaseHistoryListViewTemplate.as_view(),
        name="user-purchase-history-page",
    ),
    path(
        "user/<str:username>/received-reviews-page/",
        views.ReceivedReviewListViewTemplate.as_view(),
        name="user-received-reviews-page",
    ),
    path("user-products-page/<str:username>/", views.UserProductsListPageView.as_view(), name="user_products_page"),
    path("user/<str:username>/like-products/", views.LikeProductsPageView.as_view(), name="like-products-page"),
]
