from django.urls import path

from . import views


urlpatterns = [
    path("edit-product/<int:pk>/", views.ProductEditPageView.as_view(), name="product_edit_api"),
    path("detail-page/<int:pk>/", views.ProductDetailPageView.as_view(), name="product_detail"),
    path("create/", views.ProductCreateView.as_view(), name="product-create"),
    path("1on1-chat/<str:username>/", views.ChatRoomListHTMLView.as_view(), name="chat_room_list"),
    path("<int:product_id>/chatrooms/<int:room_id>/", views.ChatRoomDetailHTMLView.as_view(), name="chat-room-html"),
    path("edit-page/<int:pk>/", views.ProductEditPageView.as_view(), name="product_edit_page"),
]
