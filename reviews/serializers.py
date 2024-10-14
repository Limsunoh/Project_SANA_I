from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    checklist = serializers.ListField(
        child=serializers.CharField(max_length=100)
    )
    
    class Meta:
        model = Review
        fields = ['id', 'author', 'products', 'checklist', 'additional_comments', 'created_at', 'score']
        read_only_fields = ['author', 'created_at', 'score']

    def create(self, validated_data):
        # 리뷰를 먼저 생성한 후, score를 계산합니다.
        checklist = validated_data.get('checklist', [])
        review = Review.objects.create(**validated_data)
        review.score = review.total_score()  # 총점 계산
        review.save()
        return review