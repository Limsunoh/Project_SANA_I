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
            "products",
            "checklist",
            "additional_comments",
            "created_at",
            "score",
        ]
        read_only_fields = ["author", "created_at", "score"]

    def create(self, validated_data):
        
        # URL에 제품 pk참조
        request = self.context.get('request')
        validated_data['author'] = request.user
        product_pk = self.context['view'].kwargs.get('product_id')
        
        try:
            product = Product.objects.get(pk=product_pk)
        except Product.DoesNotExist:
            raise serializers.ValidationError(f"{product_pk} 게시글을 찾을 수 없습니다.")

        validated_data['products'] = product
        
        # 리뷰 생성 & 점수 계산
        # checklist = validated_data.get('checklist', [])
        review = Review.objects.create(**validated_data)
        review.score = review.total_score()
        review.save()
        
        return review
