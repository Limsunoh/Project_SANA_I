from rest_framework import serializers

from accounts.models import User
from .models import Product, Image, Hashtag, PrivateComment, ChatRoom, ChatMessage, TransactionStatus


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("nickname",)


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
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "images",
            "title",
            "content",
            "author",
            "price",
            "status",
            "hashtag",
            "hits",
            "created_at",
            "updated_at",
            "likes_count",
        )

    # 좋아요 수 카운팅
    def get_likes_count(self, obj):
        return obj.likes.count()

    # 조회수 증가 로직
    def to_representation(self, instance):
        instance.hits += 1
        instance.save(update_fields=["hits"])
        return super().to_representation(instance)
    
    


class PrivateCommentSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')
    product = serializers.StringRelatedField()


    class Meta:
        model = PrivateComment
        fields = ['id', 
                'product', 
                'sender_username', 
                'receiver_username', 
                'content', 
                'created_at', 
                'is_sold'
                ]
        read_only_fields = ['product']
    
    

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    room = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'room', 'sender', 'sender_username', 'content', 'image', 'created_at', 'is_read']
        read_only_fields = ['id', 'sender', 'sender_image', 'created_at', 'is_read', 'room']
        
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        
        sender = instance.sender
        rep['sender_image'] = sender.get_profile_image_url()
        
        return rep


class ChatRoomSerializer(serializers.ModelSerializer):
    seller_username = serializers.ReadOnlyField(source='seller.username')
    buyer_username = serializers.ReadOnlyField(source='buyer.username')
    product_title = serializers.ReadOnlyField(source='product.title')

    class Meta:
        model = ChatRoom
        fields = ['id', 'product_title', 'seller', 'buyer', 'seller_username', 'buyer_username', 'created_at']
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        
        seller = instance.seller
        buyer = instance.buyer
        rep['seller_image'] = seller.get_profile_image_url()
        rep['buyer_image'] = buyer.get_profile_image_url()
        
        return rep
        


class TransactionStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionStatus
        fields = ['id', 'room', 'is_sold', 'is_completed', 'updated_at']
