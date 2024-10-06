from rest_framework import serializers
from .models import Review
    

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model= Review
        fields= ['id', 'user', 'checklist', 'additional_comments', 'created_at', 'score']
        read_only_fields= ['author', 'created_at', 'score'] # 작성자는 자동으로 설정되며, 점수는 서버에서 계산됨.


    def create(self, validated_data):
        checklist= validated_data.get('checklist',{})
        score= self.calculate_score(checklist) # 선택한 항목들의 점수 계산
        review= Review.objects.create(
            author= self.context['request'].user,
            score= score,
            **validated_data
        )
        return review
    
    def calculate_score(self, checklist):
        score= 0
        for key, value in checklist.items():
            score += value # 예: 체크 항목의 점수 합산
        return score