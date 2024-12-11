from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

from . import views

urlpatterns = [
    path("signup/", views.UserCreateView.as_view(), name="user-signup"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("users/activate/<pk>/<token>/", views.activate_user, name="activate_user"),
    path("login/", views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("logout/", TokenBlacklistView.as_view(), name="logout"),
    path("profile/<str:username>/", views.UserProfileView.as_view()),
    path("profile/<str:username>/password/", views.ChangePasswordView.as_view()),
    path("follow/<str:username>/", views.FollowView.as_view(), name="follow_view"),
    path("user-products/<str:username>/", views.UserProductsListView.as_view(), name="user_products"),
    path("likes/<str:username>/", views.LikeListForUserAPIView.as_view(), name="like_list_for_user"),
    path("user/<str:username>/followings/", views.UserFollowingListAPIView.as_view(), name="user_followings"),
    path("user/<str:username>/followers/", views.UserFollowerListAPIView.as_view(), name="user_followers"),
    path("user/<str:username>/reviews/", views.UserReviewListView.as_view(), name="user-reviews"),
    path("user/<str:username>/purchase-history/", views.PurchaseHistoryListView.as_view(), name="user-purchase-history"),
    path("user/<str:username>/received-reviews/", views.ReceivedReviewListView.as_view(), name="user-received-reviews"),
]
