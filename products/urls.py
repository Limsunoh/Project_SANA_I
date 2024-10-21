from django.urls import path
from . import views

# app_name = "products"     # products/app.py 에 명시됨

urlpatterns = [
    # API 엔드포인트
    path("", views.ProductListAPIView.as_view(), name="product_list"),
    path("<int:pk>/", views.ProductDetailAPIView.as_view(), name="product_detail"),
    path('<int:pk>/like/', views.LikeAPIView.as_view(), name='like'),  # 개별 제품 찜 상태 확인 및 찜하기 기능
    path('<int:product_id>/chatrooms/', views.ChatRoomCreateAPIView.as_view(), name='create-chatroom'),  # 채팅방 생성
    path('chatroom/new_messages/', views.NewMessageAlertAPIView.as_view(), name='new_message_alert'),
    path('chatrooms/<str:username>/', views.ChatRoomListView.as_view(), name='chatroom_list'),
    path('<int:pk>/chatrooms/<int:room_id>/messages/', views.ChatMessageCreateAPIView.as_view(), name='create-message'),
    path('<int:pk>/chatrooms/<int:room_id>/transaction-status/', views.TransactionStatusUpdateAPIView.as_view(), name='update-transaction-status'),
    path("aisearch/", views.AISearchAPIView.as_view(), name="ai_search"),  # AI 추천 기능
    path("edit-product/<int:pk>/", views.ProductEditPageView.as_view(), name="product_edit_api"),
    
    # 프론트(화면구성) 주소
    # path('home-page/', views.HomePageView.as_view(), name='home-page'),
    path("detail-page/<int:pk>/", views.ProductDetailPageView.as_view(), name="product_detail"),
    path('create/', views.ProductCreateView.as_view(), name='product-create'),   
    path('1on1-chat/<str:username>/', views.ChatRoomListHTMLView.as_view(), name='chat_room_list'),
    path('<int:product_id>/chatrooms/<int:room_id>/', views.ChatRoomDetailHTMLView.as_view(), name='chat-room-html'),
    path("edit-page/<int:pk>/", views.ProductEditPageView.as_view(), name="product_edit_page"),
]
