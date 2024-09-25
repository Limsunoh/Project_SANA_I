from rest_framework import serializers

from accounts.models import User
from .models import Product


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ""


class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = "__all__"


class ProductDetailSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "content",
            "price",
            "status",
            "created_at",
            "updated_at"
        )