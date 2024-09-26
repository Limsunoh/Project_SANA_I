from rest_framework import serializers

from accounts.models import User
from .models import Product, Image


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ""


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

    class Meta:
        model = Product
        fields = (
            "id", 
            "title",
            "content",
            "price",
            "status",
            "preview_image",
        )
    
    # PK가 가장 낮은 이미지를 가져오는 로직
    def get_preview_image(self, instance):
        if instance.images.exists():
            lowest_pk_image = instance.images.order_by("id").first()
            return lowest_pk_image.image_url.url  # 이미지 URL 반환
        return None  # 이미지가 없으면 None을 반환


class ProductCreateSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "content",
            "price",
            "status",
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

    class Meta:
        model = Product
        fields = (
            "id",
            "images",
            "title",
            "content",
            "price",
            "status",
            "created_at",
            "updated_at",
        )
