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


class AuthorSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("nickname", "profile_image_url")

    def get_profile_image_url(self, obj):
        return obj.get_profile_image_url()


class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = (
            "id",
            "name",
        )


class ImageSerializer(serializers.ModelSerializer):
    image_url = serializers.ImageField(use_url=True)

    class Meta:
        model = Image
        fields = (
            "id",
            "image_url",
        )


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

    # 좋아요 수 카운팅
    def get_likes_count(self, obj):
        return obj.likes.count()

    # PK가 가장 낮은 이미지를 가져오는 로직
    def get_preview_image(self, instance):
        if instance.images.exists():
            lowest_pk_image = instance.images.order_by("id").first()
            return lowest_pk_image.image_url.url  # 이미지 URL 반환
        return None  # 이미지가 없으면 None을 반환


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
        if instance.images.exists():
            return list(
                instance.images.values_list("image_url", flat=True)
            )  # 이미지 URL 반환
        return None  # 이미지가 없으면 None을 반환


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    hashtag = HashtagSerializer(many=True, source="tags", required=False)
    author = serializers.StringRelatedField()
    author_profile_image_url = serializers.SerializerMethodField()
    mainaddress = serializers.CharField(
        source="author.mainaddress", read_only=True
    )  # 작성자의 mainaddress를 가져옴
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

    # 좋아요 수 카운팅
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    # 작성자의 프로필 이미지 URL을 가져오는 메서드
    def get_author_profile_image_url(self, obj):
        return obj.author.get_profile_image_url()

    # 조회수 증가 로직
    def to_representation(self, instance):
        instance.hits += 1
        instance.save(update_fields=["hits"])
        return super().to_representation(instance)
    
    # 리뷰 참조 로직
    def get_reviews(self, obj):
        # 로그를 추가하여 리뷰 데이터를 확인
        reviews = Review.objects.filter(products=obj)
        print(f"product: {obj.id}")
        print(f"review_score: {Review.score}")
        return ReviewSerializer(reviews, many=True).data
    
    # def get_reviews(self, obj):
    #     reviews = obj.reviewed_products.all() 
    #     review_scores = [review.score for review in reviews]

    #     total_score = sum(review_scores)
    #     print(total_score)

    #     # 추가적으로 가져올 데이터 필요 시, 수정 필요
    #     return {
    #         'total_score': total_score,
    #         'reviews_count': reviews.count(), 
    #         'review_details': [{'author': review.author.username, 'score': review.score} for review in reviews],
    #     }


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
        rep = super().to_representation(instance)

        sender = instance.sender
        rep["sender_image"] = sender.get_profile_image_url()
        return rep


class ChatRoomSerializer(serializers.ModelSerializer):
    seller_username = serializers.ReadOnlyField(source="seller.username")
    buyer_username = serializers.ReadOnlyField(source="buyer.username")
    product_title = serializers.ReadOnlyField(source="product.title")
    product_id = serializers.ReadOnlyField(source="product.id")
    last_message = serializers.SerializerMethodField(read_only=True)

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
        rep = super().to_representation(instance)

        seller = instance.seller
        buyer = instance.buyer
        rep["seller_image"] = seller.get_profile_image_url()
        rep["buyer_image"] = buyer.get_profile_image_url()
        return rep

    def get_last_message(self, instance):
        if instance.messages.exists():
            last_message = instance.messages.order_by("id").last()
            return last_message.content  # 마지막 내용을 반환
        return None


class TransactionStatusSerializer(serializers.ModelSerializer):
    seller = serializers.CharField(source='room.seller.username', read_only=True)
    buyer = serializers.CharField(source='room.buyer.username', read_only=True)

    class Meta:
        model = TransactionStatus
        fields = ['id', 'room', 'is_sold', 'is_completed', 'updated_at', 'seller', 'buyer']
