from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Review
    

# class ReviewScoreSerializer(serializers.ModelSerializer):


    # class Meta:
    #     model= ReviewScore
    #     fields= ['score']


class ReviewSerializer(ModelSerializer):
    # total_score= serializers.SerializerMethodField()

    class Meta:
        model= Review
        fields= [
            'id', 'product', 'user', 
            'cheecklist_1', 'cheecklist_2', 'cheecklist_3', 
            'cheecklist_4', 'cheecklist_5', 'cheecklist_6', 
            'cheecklist_7', 'cheecklist_8', 'cheecklist_9',
            'cheecklist_10', 'written_feedback', 'created_at', 
            'total_score'
        ]
        read_only_fields= ['id', 'created_at', 'user', 'checked_items']        

def get_total_score(self, obj):
    return obj.total_score()

def get_checked_items(self, obj):
    # 체된 항목 필터링(자세히 보기)
    checklist= {
        'checklist_1': obj.checklist_1, 
        'checklist_2': obj.checklist_2, 
        'checklist_3': obj.checklist_3, 
        'checklist_4': obj.checklist_4, 
        'checklist_5': obj.checklist_5, 
        'checklist_6': obj.checklist_6, 
        'checklist_7': obj.checklist_7, 
        'checklist_8': obj.checklist_8, 
        'checklist_9': obj.checklist_9, 
        'checklist_10': obj.checklist_10, 
    }
    # 체크된 항목만 반환 (True 값만 반환)
    return [key for key, value in checklist.items() if value]

# class ReviewCreateSerializer(serializers.ModelSerializer):
    
#     class Meta:
#         pass


# class ReviewDeleteSerializer(serializers.ModelSerializer):
    
#     class Meta:
#         pass

