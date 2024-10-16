from rest_framework import serializers
from .models import Review
from products.models import Product


class ReviewSerializer(serializers.ModelSerializer):
    checklist = serializers.ListField(child=serializers.CharField(max_length=100))

    class Meta:
        model = Review
        fields = [
            "id",
            "author",
            "checklist",
            "additional_comments",
            "created_at",
            "score",
        ]
        read_only_fields = ["author", "created_at", "score"]

    def create(self, validated_data):
        # URL에 제품 pk 참조
        request = self.context.get('request')
        validated_data['author'] = request.user

        # 리뷰 생성
        review = Review.objects.create(**validated_data)
        review.score = review.total_score()
        review.save()

        return review
