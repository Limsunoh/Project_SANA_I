from rest_framework.permissions import BasePermission
from django.db.models import Q

# [소유자만 수정 가능] 객체의 소유자만 수정할 수 있고, 그 외 사용자는 읽기만 허용
class IsOwnerOrReadOnly(BasePermission):

    def has_object_permission(self, request, view, obj):
        # [읽기 요청 허용] 모든 사용자에게 허용
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        # [쓰기 요청 제한] 객체의 소유자만 수정 및 삭제가 가능
        return obj.author == request.user


# [관리자 권한 확인] 사용자가 슈퍼유저거나 스태프 권한을 가지고 있는지 확인
class IsSuperUser(BasePermission):

    def has_permission(self, request, view):
        # [권한 조건] 사용자가 인증된 상태이며, 관리자 또는 스태프인 경우 True 반환
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.is_staff)
        )


# [발신자 또는 수신자만 접근 가능] PrivateComment 객체에서 발신자 또는 수신자만 접근 가능한 권한 (채팅 관련)
# 판매자 구매자 구분이 안되서 SellerorBuyerOnly 를 사용한 방식으로 교체
class SenderorReceiverOnly(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user
        # [접근 조건] 현재 사용자가 발신자 또는 수신자와 일치하면 True 반환
        return obj.sender == user or obj.receiver == user


# [판매자 또는 구매자만 접근 가능] PrivateComment 객체에서 판매자 또는 구매자만 접근 가능한 권한 (채팅 관련)
class SellerorBuyerOnly(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user
        # [접근 조건] 현재 사용자가 판매자 또는 구매자와 일치하면 True 반환
        return obj.seller == user or obj.buyer == user
