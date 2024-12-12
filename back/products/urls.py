from django.urls import path

from . import views


urlpatterns = [
    path("", views.ProductListAPIView.as_view(), name="product_list"),
    path("<int:pk>/", views.ProductDetailAPIView.as_view(), name="product_detail"),
    path("<int:pk>/like/", views.LikeAPIView.as_view(), name="like"),
    path("<int:product_id>/chatrooms/", views.ChatRoomCreateAPIView.as_view(), name="create-chatroom"),
    path("chatroom/new_messages/", views.NewMessageAlertAPIView.as_view(), name="new_message_alert"),
    path("chatrooms/<str:username>/", views.ChatRoomListView.as_view(), name="chatroom_list"),
    path("<int:pk>/chatrooms/<int:room_id>/messages/", views.ChatMessageCreateAPIView.as_view(), name="create-message"),
    path("chatroom/<int:room_id>/leave/", views.LeaveChatRoomAPIView.as_view(), name="leave_chatroom"),
    path(
        "<int:pk>/chatrooms/<int:room_id>/transaction-status/",
        views.TransactionStatusUpdateAPIView.as_view(),
        name="update-transaction-status",
    ),
    path("aisearch/", views.AISearchAPIView.as_view(), name="ai_search"),
]
