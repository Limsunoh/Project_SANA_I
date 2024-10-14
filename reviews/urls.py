from django.urls import path
from . import views

urlpatterns = [
    # 유저가 작성한 리뷰 목록 조회 (유저 프로필 페이지)
    path('user/<int:user_id>/', views.UserReviewListView.as_view(), name='user-review-list'),

    # 제품 상세 페이지에서 리뷰 작성
    path('products/<int:product_id>/', views.ReviewCreateView.as_view(), name='product-review-create'),

    # 리뷰 상세 조회 및 삭제
    path('<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
]