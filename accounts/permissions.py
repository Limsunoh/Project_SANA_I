from rest_framework.permissions import BasePermission
from products.models import PrivateComment
from django.db.models import Q


    #객체의 소유자만 수정할 수 있고, 나머지 사용자는 읽기만 가능하게 설정.
class IsOwnerOrReadOnly(BasePermission):

    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 누구나 허용
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        # 쓰기 권한은 객체의 소유자에게만 허용
        return obj == request.user
    
    
class SenderorReceiverOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        # obj가 PrivateComment 객체일 때, sender 또는 receiver가 현재 사용자와 일치하는지 확인
        return obj.sender == user or obj.receiver == user