from django.urls import path

from . import views


app_name = "products"
urlpatterns = [
    path("", views.ProductListAPIView.as_view(), name="product_list"),
    path("<int:pk>/", views.ProductDetailAPIView.as_view(), name="product_detail"),
    path('<int:pk>/like/', views.LikeAPIView.as_view(), name='like'),  # 찜하기 및 찜한 목록 조회
    path("<int:pk>/comment/", views.CommentListCreateView.as_view(), name='comment'),
    path('<int:product_id>/chatrooms/', views.ChatRoomCreateAPIView.as_view(), name='create-chatroom'),  # 채팅방 생성
    path('<int:pk>/chatrooms/<int:room_id>/messages/', views.ChatMessageCreateAPIView.as_view(), name='create-message'),
    path('<int:pk>/chatrooms/<int:room_id>/transaction-status/', views.TransactionStatusUpdateAPIView.as_view(), name='update-transaction-status'),
    path('<int:product_id>/chatrooms/<int:room_id>/html/', views.ChatRoomHTMLView.as_view(), name='chat-room-html'),
]