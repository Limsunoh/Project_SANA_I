from django.urls import path

from .views import AiAskView, NotificationDetailView, NotificationListView

urlpatterns = [
    path("notification/", NotificationListView.as_view(), name="notification-list"),  # 공지사항 CRUD
    path("notification/<int:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
    path("aiask/", AiAskView.as_view(), name="aiask"),
]
