from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views


app_name = "products"

urlpatterns = [
    # API 앤드포인트
    path("", views.ProductListAPIView.as_view(), name="product_list"),
    path('user-products/<str:username>/', views.UserProductsListView.as_view(), name='user_products'),
    path("<int:pk>/", views.ProductDetailAPIView.as_view(), name="product_detail"),
    path('<int:pk>/like/', views.LikeAPIView.as_view(), name='like'),  # 개별 제품 찜 상태 확인 및 찜하기 기능
    path('likes/<str:username>/', views.LikeListForUserAPIView.as_view(), name='like_list_for_user'),
    path('<int:product_id>/chatrooms/', views.ChatRoomCreateAPIView.as_view(), name='create-chatroom'),  # 채팅방 생성
    path('chatrooms/<str:username>/', views.ChatRoomListView.as_view(), name='chatroom_list'),
    path('<int:pk>/chatrooms/<int:room_id>/messages/', views.ChatMessageCreateAPIView.as_view(), name='create-message'),
    path('<int:pk>/chatrooms/<int:room_id>/transaction-status/', views.TransactionStatusUpdateAPIView.as_view(), name='update-transaction-status'),
    path("aisearch/", views.AISearchAPIView.as_view(), name="ai_search"),  # AI 추천 기능
    path("edit-product/<int:pk>/", views.ProductEditPageView.as_view(), name="product_edit_api"),
    
    # 프론트(화면구성) 주소
    path('home-page/', views.HomePageView.as_view(), name='home-page'),
    path("detail-page/<int:pk>/", views.ProductDetailPageView.as_view(), name="product_detail"),
    path('create/', views.ProductCreateView.as_view(), name='product-create'),
    path('update/<int:pk>/', views.ProductupdateView.as_view(), name= 'product-update'),
    path('user-products-page/<str:username>/', views.UserProductsListPageView.as_view(), name='user_products_page'),
    path('user/<str:username>/like-products/', views.LikeProductsPageView.as_view(), name='like-products-page'),    
    path('1on1-chat/<str:username>/', views.ChatRoomListHTMLView.as_view(), name='chat_room_list'),
    path('<int:product_id>/chatrooms/<int:room_id>/', views.ChatRoomDetailHTMLView.as_view(), name='chat-room-html'),

    path("edit-page/<int:pk>/", views.ProductEditPageView.as_view(), name="product_edit_page"),
]
