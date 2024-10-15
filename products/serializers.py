from rest_framework import serializers
from accounts.models import User
from .models import (
    Product,
    Image,
    Hashtag,
    ChatRoom,
    ChatMessage,
    TransactionStatus,
)
from reviews.serializers import ReviewSerializer
from reviews.models import Review


# [작성자 정보 시리얼라이저] 작성자의 닉네임 + 프로필 이미지 URL 반환
class AuthorSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("nickname", "profile_image_url")

    def get_profile_image_url(self, obj):
        return obj.get_profile_image_url()


# [해시태그 시리얼라이저] 해시태그 id, 이름 반환
class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = (
            "id",
            "name",
        )


# [이미지] 이미지 관련 정보 반환
class ImageSerializer(serializers.ModelSerializer):
    image_url = serializers.ImageField(use_url=True)

    class Meta:
        model = Image
        fields = (
            "id",
            "image_url",
        )


# [상품 목록] 상품의 주요 정보 반환
class ProductListSerializer(serializers.ModelSerializer):
    preview_image = serializers.SerializerMethodField(read_only=True)
    author = serializers.StringRelatedField(read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "preview_image",
            "title",
            "author",
            "price",
            "status",
            "hits",
            "likes_count",
        )

    def get_likes_count(self, obj):
        # [좋아요 관련] 해당 상품의 좋아요 수를 반환
        return obj.likes.count()

    def get_preview_image(self, instance):
        # [미리보기 이미지] PK가 가장 낮은 이미지를 선택
        if instance.images.exists():
            lowest_pk_image = instance.images.order_by("id").first()
            return lowest_pk_image.image_url.url
        return None


# [상품 생성 시리얼라이저] 상품 생성 시 필요한 정보 반환
class ProductCreateSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField(read_only=True)
    hashtag = serializers.CharField(required=False)
    author = serializers.StringRelatedField()

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "content",
            "author",
            "price",
            "status",
            "hashtag",
            "images",
        )
        write_only_fields = ("content",)

    def get_images(self, instance):
        # [이미지 URL 반환] 해당 상품의 이미지 url 목록
        if instance.images.exists():
            return list(instance.images.values_list("image_url", flat=True))
        return None


# [상품 상세 시리얼라이저] 상품의 상세 정보와 리뷰 정보 반환
class ProductDetailSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    hashtag = HashtagSerializer(many=True, source="tags", required=False)
    author = serializers.StringRelatedField()
    author_profile_image_url = serializers.SerializerMethodField()
    mainaddress = serializers.CharField(
        source="author.mainaddress", read_only=True
    )
    likes_count = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "images",
            "title",
            "content",
            "author",
            "author_profile_image_url",
            "mainaddress",
            "price",
            "status",
            "hashtag",
            "hits",
            "created_at",
            "updated_at",
            "likes_count",
            "reviews",
        )

    def get_likes_count(self, obj):
        # [좋아요 수 반환] 상품의 좋아요 수 반환
        return obj.likes.count()

    def get_author_profile_image_url(self, obj):
        # [작성자 프로필 이미지 URL 반환] 작성자의 프로필 이미지 URL 반환
        return obj.author.get_profile_image_url()

    def to_representation(self, instance):
        # [조회수 증가] 상품 조회 시 조회수 (hits) 증가
        instance.hits += 1
        instance.save(update_fields=["hits"])
        return super().to_representation(instance)

    def get_reviews(self, obj):
        # [리뷰 정보 반환] 해당 상품의 리뷰 목록 반환
        reviews = Review.objects.filter(products=obj)
        print(f"product: {obj.id}")
        print(f"review_score: {Review.score}")
        return ReviewSerializer(reviews, many=True).data


# [채팅 메시지 시리얼라이저] 채팅 메시지 정보 반환
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source="sender.username")
    room = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "room",
            "sender",
            "sender_username",
            "content",
            "image",
            "created_at",
            "is_read",
        ]
        read_only_fields = [
            "id",
            "sender",
            "sender_image",
            "created_at",
            "is_read",
            "room",
        ]

    def to_representation(self, instance):
        # [메시지 표현] 메시지 + 발신자 이미지 반환
        rep = super().to_representation(instance)
        rep["sender_image"] = instance.sender.get_profile_image_url()
        return rep


# [채팅방 시리얼라이저] 채팅방 정보 + 마지막 메시지 반환
class ChatRoomSerializer(serializers.ModelSerializer):
    seller_username = serializers.ReadOnlyField(source="seller.username")
    buyer_username = serializers.ReadOnlyField(source="buyer.username")
    product_title = serializers.ReadOnlyField(source="product.title")
    product_id = serializers.ReadOnlyField(source="product.id")
    last_message = serializers.SerializerMethodField(read_only=True) # 마지막 메시지

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "product_title",
            "product_id",
            "seller",
            "buyer",
            "seller_username",
            "buyer_username",
            "last_message",
            "created_at",
        ]

    def to_representation(self, instance):
        # [채팅방 표현] 채팅방 정보, 판매자, 구매자 이미지
        rep = super().to_representation(instance)
        rep["seller_image"] = instance.seller.get_profile_image_url()
        rep["buyer_image"] = instance.buyer.get_profile_image_url()
        return rep

    def get_last_message(self, instance):
        # [마지막 메시지] 채팅방의 마지막 메시지 반환
        if instance.messages.exists():
            last_message = instance.messages.order_by("id").last()
            return last_message.content
        return None


# [거래 상태 시리얼라이저] 거래 상태 정보 반환
class TransactionStatusSerializer(serializers.ModelSerializer):
    seller = serializers.CharField(source='room.seller.username', read_only=True)
    buyer = serializers.CharField(source='room.buyer.username', read_only=True)

    class Meta:
        model = TransactionStatus
        fields = ['id', 'room', 'is_sold', 'is_completed', 'updated_at', 'seller', 'buyer']
