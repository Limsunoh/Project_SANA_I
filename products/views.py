from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
import time

from accounts.permissions import (
                                IsOwnerOrReadOnly,
                                SenderorReceiverOnly,
                                SellerorBuyerOnly
                                )
from .models import (
                    Product,
                    Image, 
                    Hashtag, 
                    PrivateComment, 
                    ChatMessage, 
                    ChatRoom, 
                    TransactionStatus,
                    )
from .serializers import (
    ProductListSerializer,
    ProductCreateSerializer,
    ProductDetailSerializer,
    PrivateCommentSerializer,
    ChatMessageSerializer,
    TransactionStatusSerializer,
    ChatRoomSerializer
)
from .pagnations import ProductPagnation
from django.views.generic import TemplateView

class ProductListAPIView(ListCreateAPIView):
    pagination_class = ProductPagnation
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        search = self.request.query_params.get("search")
        order_by = self.request.query_params.get("order_by")
        queryset = Product.objects.all()

        # 검색
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )

        # 정렬
        if order_by == "likes":
            queryset = queryset.annotate(likes_count=Count("likes")).order_by(
                "-likes_count"
            )
        else:  # 기본값은 최신순
            queryset = queryset.order_by("-created_at")

        return queryset

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.serializer_class = ProductCreateSerializer
        images = request.FILES.getlist("images")
        if not images:  # 이미지 key error 처리
            return Response({"ERROR": "Image file is required."}, status=400)
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):

        images = self.request.FILES.getlist("images")
        tags = self.request.data.getlist("tags")
        product = serializer.save(author=self.request.user)
        for image in images:
            Image.objects.create(product=product, image_url=image)
        for tag in tags:
            print(tag)
            hashtag, created = Hashtag.objects.get_or_create(
                name=tag
            )  # 해시태그가 존재하지 않으면 생성
            product.tags.add(hashtag)  # 제품에 해시태그 추가


class ProductDetailAPIView(UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly,IsOwnerOrReadOnly]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductDetailSerializer(product)
        return Response(serializer.data, status=200)

    def perform_update(self, serializer):
        images_data = self.request.FILES.getlist("images")
        tags = self.request.data.getlist("tags")
        instance = serializer.instance  # 현재 수정 중인 객체

        # 요청에 이미지가 포함된 경우
        if images_data:
            # 기존 이미지 삭제
            instance.images.all().delete()
            for image_data in images_data:
                Image.objects.create(product=instance, image_url=image_data)

        if tags is not None:  # 새로운 해시태그가 제공된 경우
            # 기존 해시태그를 삭제하고 새로운 해시태그를 추가
            instance.tags.clear()  # 기존 해시태그 삭제
            for tag in tags:
                hashtag, created = Hashtag.objects.get_or_create(name=tag)
                instance.tags.add(hashtag)  # 제품에 해시태그 추가

        serializer.save()

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response(status=204)


class LikeAPIView(APIView):
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated]

    # 유저가 찜한 제품 리스트 반환
    def get(self):
        return Product.objects.filter(likes=self.request.user)

    # 찜하기 기능 처리
    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)

        # 이미 찜한 제품이면 찜하기 취소
        if request.user in product.likes.all():
            product.likes.remove(request.user)
            return Response({"message": "찜하기 취소했습니다."}, status=200)

        # 찜하기 추가
        product.likes.add(request.user)
        return Response({"message": "찜하기 했습니다."}, status=200)


class CommentListCreateView(ListCreateAPIView):
    permission_classes = [SenderorReceiverOnly]
    queryset = PrivateComment.objects.all().order_by("-pk")
    serializer_class = PrivateCommentSerializer
    
    def get(self, request, *args, **kwargs):
        user = request.user
        comments = PrivateComment.objects.filter(Q(sender=user) | Q(receiver=user))
        serializer = PrivateCommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data, status=200)


    def perform_create(self, serializer):
        product = get_object_or_404(Product, pk=self.kwargs["pk"])
        sender = self.request.user
        receiver = product.author
        serializer.save(sender=sender, product=product, receiver=receiver)


# 새로운 채팅방 만들기
class ChatRoomCreateAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly,SellerorBuyerOnly]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        chat_rooms = ChatRoom.objects.filter(Q(seller=user) | Q(buyer=user))
        serializer = ChatRoomSerializer(chat_rooms, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, product_id, *args, **kwargs):
        product = get_object_or_404(Product, id=product_id)

        # 이미 채팅방이 존재하는지 확인 (동일한 판매자와 구매자 간)
        existing_room = ChatRoom.objects.filter(product=product, seller=product.author, buyer=request.user).first()
        if existing_room:
            return Response({"detail": "해당 상품에 대한 채팅방이 이미 존재합니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 새로운 채팅방 생성
        chat_room = ChatRoom.objects.create(
            product=product,
            seller=product.author,  # 상품의 판매자
            buyer=request.user,  # 요청을 보낸 사용자 (구매자)
        )

        serializer = ChatRoomSerializer(chat_room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# 새로운 채팅 메시지 생성
class ChatMessageCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, room_id, *args, **kwargs):
        user = request.user
        last_message_id = request.query_params.get('last_message_id', None)
        room = get_object_or_404(ChatRoom.objects.filter(Q(seller=user) | Q(buyer=user)), id=room_id)
        new_messages = []

        # 롱 폴링 대기 시간 (최대 30초)
        timeout = 30
        start_time = time.time()

        while (time.time() - start_time) < timeout:
            # 새 메시지 확인
            if last_message_id:
                new_messages = ChatMessage.objects.filter(room=room, id__gt=last_message_id)
            else:
                new_messages = ChatMessage.objects.filter(room=room)

            if new_messages.exists():
                break 

            time.sleep(2)  # 2초마다 새 메시지 확인

        serializer = ChatMessageSerializer(new_messages, many=True)
        return Response(serializer.data)
    

    def post(self, request, room_id, *args, **kwargs):
        room = get_object_or_404(ChatRoom, id=room_id)
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user, room=room)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# 거래 상태를 업데이트하는 API
class TransactionStatusUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id, *args, **kwargs):
        room = get_object_or_404(ChatRoom, id=room_id)
        status = get_object_or_404(TransactionStatus, room=room)

        # 판매 완료 및 구매 완료 상태 업데이트
        if request.data.get('is_sold') is not None:
            status.is_sold = request.data.get('is_sold')
        if request.data.get('is_completed') is not None:
            status.is_completed = request.data.get('is_completed')

        status.save()
        serializer = TransactionStatusSerializer(status)
        return Response(serializer.data)

# 채팅방 HTML 페이지를 보내주는 View
class ChatRoomHTMLView(TemplateView):
    template_name = "chat_room.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['room_id'] = self.kwargs['room_id']  # URL에서 room_id를 가져와서 전달
        context['product_id'] = self.kwargs['product_id']  # URL에서 product_id를 가져와서 전달
        return context