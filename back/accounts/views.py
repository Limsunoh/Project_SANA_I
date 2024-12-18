from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView

from back.products.models import Product
from back.products.serializers import ProductListSerializer
from back.reviews.models import Review
from back.reviews.serializers import PurchaseSerializer, ReviewSerializer

from .models import User
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    UserChangeSerializer,
    UserListSerializer,
    UserProfileSerializer,
    UserSerializer,
)


# [사용자 생성 뷰] 새로운 사용자 계정을 생성
class UserCreateView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # [데이터 검증] 사용자가 입력한 데이터의 유효성 체크
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("데이터 검증 오류:", serializer.errors)
            return Response(serializer.errors, status=400)

        # [사용자 생성] 해당 데이터로 사용자객체 생성
        self.perform_create(serializer)
        return Response({"message": "success"}, status=201)


# [이메일 인증] 이메일 인증 완료 시 is_active = True 해 계정 활성화해주는 로직
def activate_user(request, pk, token):
    try:
        # [사용자 ID 복원] pk를 디코딩하여 사용자 객체를 가져옴
        pk = force_str(urlsafe_base64_decode(pk))
        user = User.objects.get(pk=pk)

        # [토큰 유효성 검증] 제공된 토큰이 유효한지 확인
        token_obj = AccessToken(token)

        if token_obj and token_obj["user_id"] == user.id:
            user.is_active = True  # 사용자의 계정을 활성화
            user.save()
            return HttpResponse("이메일 인증이 완료되었습니다! 로그인하세요.")
        return HttpResponse("유효하지 않은 토큰입니다.", status=400)

    # 기타 오류
    except User.DoesNotExist:
        return HttpResponse("사용자가 존재하지 않습니다.", status=400)

    except Exception as e:
        return HttpResponse(f"에러 발생: {e}", status=400)


# [사용자 프로필 뷰] 프로필 정보 조회, 수정, 삭제
class UserProfileView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    lookup_field = "username"
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return UserProfileSerializer

        elif self.request.method in ["PATCH", "PUT"]:
            return UserChangeSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        return User.objects.all()

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # [프로필 이미지 삭제] remove_image 플래그 처리
        if request.data.get("remove_image") == "true":
            if user.image:
                user.image.delete()

        # [프로필 이미지 업데이트] 새로운 이미지가 업로드 되었을 경우
        if "image" in request.FILES:
            user.image = request.FILES["image"]

        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        user = get_object_or_404(User, username=kwargs.get("username"))
        if user == request.user:
            user.is_active = False  # 계정 비활성화
            products = Product.objects.filter(author=user)
            products.delete()  # 상품 게시글 삭제
            user.save()
            return Response({"message": "삭제처리가 완료되었습니다."}, status=200)
        return Response({"message": "삭제처리할 권한이 없습니다."}, status=403)


# [비밀번호 변경] 사용자의 비밀번호를 변경
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def patch(self, request, username):
        # [사용자 조회] 비밀번호를 변경할 사용자 조회
        get_object_or_404(User, username=username)
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            return Response({"message": "success"}, status=200)
        return Response(serializer.errors, status=400)


# [팔로우 기능] 팔로우 및 언팔로우 처리
class FollowView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        # [팔로우 상태 확인] 요청자가 해당 사용자를 팔로우 중인지 확인
        user = User.objects.get(username=username)
        is_following = request.user in user.followers.all()
        return Response({"is_following": is_following}, status=200)

    def post(self, request, username):
        # [팔로우/언팔로우 처리] 요청자의 팔로우 상태를 변경
        target_user = get_object_or_404(User, username=username)
        current_user = request.user
        if current_user in target_user.followers.all():
            target_user.followers.remove(current_user)
            return Response("unfollow했습니다.", status=200)
        target_user.followers.add(current_user)
        return Response("follow했습니다.", status=200)


# [팔로잉 목록 조회] 사용자의 팔로잉 목록을 반환
class UserFollowingListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followings = user.followings.all()
        serializer = UserListSerializer(followings, many=True)
        return Response(serializer.data, status=200)


# [팔로워 목록 조회] 사용자의 팔로워 목록을 반환
class UserFollowerListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followers = user.followers.all()
        serializer = UserListSerializer(followers, many=True)
        return Response(serializer.data, status=200)


# [커스텀 토큰 생성] 사용자 이름을 포함한 JWT 토큰 생성
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # 사용자가 입력한 username으로 사용자 객체를 가져옴
        user = get_object_or_404(User, username=request.data.get("username"))
        username = request.data.get("username")
        request.data.get("password")
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "아이디나 비밀번호를 확인해주세요."}, status=401)
        if not user.is_active:
            return Response({"detail": "이메일 인증을 완료해 주세요."}, status=403)
        return super().post(request, *args, **kwargs)


# [찜한 상품 목록 조회 API] 사용자가 찜한 상품 목록 반환
class LikeListForUserAPIView(APIView):
    permission_classes = [AllowAny]

    # 사용자가 찜한 상품 목록을 조회하고 반환
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        liked_products = Product.objects.filter(likes=user)
        serializer = ProductListSerializer(liked_products, many=True)
        return Response(serializer.data, status=200)


# [사용자 상품 목록 API] 사용자가 작성한 상품 목록 조회
class UserProductsListView(ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        username = self.kwargs.get("username")
        return Product.objects.filter(author__username=username)


# [사용자 구매 내역 API] 사용자가 구매한 상품 목록 조회
class PurchaseHistoryListView(ListAPIView):
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Product.objects.filter(chatrooms__buyer=user, chatrooms__status__is_sold=True)


# [사용자 작성한 후기 API] 사용자가 작성한 후기 목록 조회
class UserReviewListView(ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        username = self.kwargs.get("username")
        user = get_object_or_404(User, username=username)
        return Review.objects.filter(author=user, is_deleted=False)


# [사용자 받은 후기 API] 사용자가 받은 후기 조회 (매너점수 클릭 시)
class ReceivedReviewListView(ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        username = self.kwargs.get("username")
        user = get_object_or_404(User, username=username)
        return Review.objects.filter(product__author=user, is_deleted=False)
