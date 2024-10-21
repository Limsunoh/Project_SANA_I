from django.urls import path
from . import views

# app_name = "products"     # products/app.py 에 명시됨

urlpatterns = [
    # API 엔드포인트
    
    # 전체 상품 목록 API
    path("", views.ProductListAPIView.as_view(), name="product_list"),
    # 특정 상품 상세 API
    path("<int:pk>/", views.ProductDetailAPIView.as_view(), name="product_detail"),
    # 개별 제품 찜 상태 확인 및 찜하기 기능 API
    path('<int:pk>/like/', views.LikeAPIView.as_view(), name='like'),
    # 채팅방 생성 API (특정 상품에 대한 채팅방 생성)
    path('<int:product_id>/chatrooms/', views.ChatRoomCreateAPIView.as_view(), name='create-chatroom'),
    # 새 메시지 알림 API
    path('chatroom/new_messages/', views.NewMessageAlertAPIView.as_view(), name='new_message_alert'),
    # 특정 사용자의 채팅방 목록 API
    path('chatrooms/<str:username>/', views.ChatRoomListView.as_view(), name='chatroom_list'),
    # 특정 채팅방 메시지 조회 및 생성 API
    path('<int:pk>/chatrooms/<int:room_id>/messages/', views.ChatMessageCreateAPIView.as_view(), name='create-message'),
    # 채팅방 나가기 기능 API
    path('chatroom/<int:room_id>/leave/', views.LeaveChatRoomAPIView.as_view(), name='leave_chatroom'),
    # 거래 상태 업데이트 API
    path('<int:pk>/chatrooms/<int:room_id>/transaction-status/', views.TransactionStatusUpdateAPIView.as_view(), name='update-transaction-status'),
    # AI 추천 기능 API
    path("aisearch/", views.AISearchAPIView.as_view(), name="ai_search"),
    # 상품 수정 API
    path("edit-product/<int:pk>/", views.ProductEditPageView.as_view(), name="product_edit_api"),
    
    
    # 프론트(화면구성) 주소
    
    # 특정 상품 상세 페이지
    path("detail-page/<int:pk>/", views.ProductDetailPageView.as_view(), name="product_detail"),
    # 상품 생성 페이지
    path('create/', views.ProductCreateView.as_view(), name='product-create'),
    # 1:1 채팅방 목록 페이지
    path('1on1-chat/<str:username>/', views.ChatRoomListHTMLView.as_view(), name='chat_room_list'),
    # 특정 상품에 대한 채팅방 상세 페이지
    path('<int:product_id>/chatrooms/<int:room_id>/', views.ChatRoomDetailHTMLView.as_view(), name='chat-room-html'),
    # 상품 수정 페이지
    path("edit-page/<int:pk>/", views.ProductEditPageView.as_view(), name="product_edit_page"),
]


