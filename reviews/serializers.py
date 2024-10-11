from rest_framework import serializers
from .models import Review
    

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model= Review
        fields= ['id', 'author', 'products', 'checklist','additional_comments', 'score', 'created_at']
        read_only_fields= ['author', 'created_at', 'score'] # 작성자는 자동으로 설정되며, 점수는 서버에서 계산됨.

    def validate_checklist(self, value):
        # 체크리스트의 구조를 검증하는 로직을 여기에 추가
        return value

    def create(self, validated_data):
        # 총점을 계산
        checklist= validated_data.get('checklist')
        score= sum(1 for k, v in checklist.items() if v)  # True 값의 개수를 총점으로 설정
        validated_data['score'] = score
        return super().create(validated_data)
    
    # def calculate_score(self, checklist):
    #     score= 0
    #     for key, value in checklist.items():
    #         score += value # 예: 체크 항목의 점수 합산
    #     return score