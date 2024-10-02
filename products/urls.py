from django.urls import path

from . import views


app_name = "products"
urlpatterns = [
    path("", views.ProductListAPIView.as_view(), name="product_list"),
    path("<int:pk>", views.ProductDetailAPIView.as_view(), name="product_detail"),
    path('<int:pk>/like/', views.LikeAPIView.as_view(), name='like'),  # 찜하기 및 찜한 목록 조회
    path("aisearch/", views.AISearchAPIView.as_view(), name="ai_search"),  # AI 추천 기능
]