from django.apps import apps
from rest_framework.serializers import (
    CharField,
    DecimalField,
    ListField,
    ModelSerializer,
    SerializerMethodField,
)

from .models import Review


class ReviewSerializer(ModelSerializer):
    checklist = ListField(child=CharField(max_length=100))
    product_title = CharField(source="product.title", read_only=True)
    product_price = DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    product_image = SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "author",
            "checklist",
            "additional_comments",
            "created_at",
            "score",
            "product_title",
            "product_price",
            "product_image",
            "product_id",
        ]
        read_only_fields = ["author", "created_at", "score"]

    def create(self, validated_data):
        # URL에 제품 pk 참조
        request = self.context.get("request")
        validated_data["author"] = request.user

        # 리뷰 생성
        review = Review.objects.create(**validated_data)
        review.score = review.total_score()
        review.save()

        return review

    def get_product_image(self, obj):
        first_image = obj.product.images.first()
        return first_image.image_url.url if first_image else "/static/images/default_image.jpg"


class PurchaseSerializer(ModelSerializer):
    product_image = SerializerMethodField()

    class Meta:
        # Product 모델을 가져오기 위해 apps.get_model 사용
        # 순환 import->2중으로 가져오려고 할때 자주 발생->가장 흔한 방법이 apps.get_model()사용하기
        model = apps.get_model("products", "Product")
        fields = [
            "id",
            "title",
            "price",
            "created_at",
            "product_image",
        ]

    def get_product_image(self, obj):
        first_image = obj.images.first()
        return first_image.image_url.url if first_image else "/static/images/default_image.jpg"
