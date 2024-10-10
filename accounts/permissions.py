from rest_framework.permissions import BasePermission
from django.db.models import Q


# 객체의 소유자만 수정 가능하고, 나머지 사용자는 읽기만 가능
class IsOwnerOrReadOnly(BasePermission):

    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 누구나 허용
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        # 쓰기 권한은 객체의 소유자에게만 허용
        return obj == request.user


# 관리자나 스태프 권한을 갖고있는지 판단하기 위한 용도
class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.is_staff)
        )

    ## 유저고 인증된 유저이며 그중에서도 슈퍼유저 또는 스태프다.


class SenderorReceiverOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        # obj가 PrivateComment 객체일 때, sender 또는 receiver가 현재 사용자와 일치하는지 확인
        return obj.sender == user or obj.receiver == user


class SellerorBuyerOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        # obj가 PrivateComment 객체일 때, sender 또는 receiver가 현재 사용자와 일치하는지 확인
        return obj.seller == user or obj.buyer == user
