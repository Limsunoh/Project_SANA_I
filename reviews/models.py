from django.db import models
from sbmarket import settings


# 리뷰
class Review(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name= 'reviewws', on_delete= models.CASCADE
    )                  # 계정 삭제 시, 같이 삭제
    products = models.ForeignKey('products.Product',
        related_name= 'reviewed_products', 
        on_delete= models.CASCADE
    )
    checklist= models.JSONField({
        "quality": True,
        "value_for_money": False,
        "usability": True,
        "design": True
    })  # 선택 항목 저장(객관식)
    additional_comments= models.TextField(blank= True) # 추가 작성(서술식)
    created_at= models.DateTimeField(auto_now_add= True) # 작성 일시
    score= models.IntegerField() # 총점 (항목별 점수 합산)
    
    def __str__(self):
        return f"Review by {self.author.username} on {self.product.name}"
    
    class Meta:
        unique_together= ('author', 'products') # 한 상품에 대해 한 명이 하나의 리뷰만 작성
    
    
# 선택 항목(increase_feedback, deduct_answer)
# cheecklist_1= models.BooleanField(default= False, null= True)
# cheecklist_2= models.BooleanField(default= False, null= True)
# cheecklist_3= models.BooleanField(default= False, null= True)
# cheecklist_4= models.BooleanField(default= False, null= True)
# cheecklist_5= models.BooleanField(default= False, null= True)
# cheecklist_6= models.BooleanField(default= False, null= True)
# cheecklist_7= models.BooleanField(default= False, null= True)
# cheecklist_8= models.BooleanField(default= False, null= True)
# cheecklist_9= models.BooleanField(default= False, null= True)
# cheecklist_10= models.BooleanField(default= False, null= True)

# class Meta:
#     ordering= ['-created_at'] # 내림차순 정렬(최신 우선)

# def total_score(self):   # 객관식 개별 점수
#     score_mapping= {
#         'cheecklist_1':0.1, 
#         'cheecklist_2':0.1, 
#         'cheecklist_3':0.1, 
#         'cheecklist_4':0.1, 
#         'cheecklist_5':0.1, 
#         'cheecklist_6':-0.1, 
#         'cheecklist_7':-0.1, 
#         'cheecklist_8':-0.1, 
#         'cheecklist_9':-0.1, 
#         'cheecklist_10':-0.1, 
#     }
#     score = 10
#     for field, value in score_mapping.items():
#         if getattr(self, field):
#             score += value
#     return score
#     def __str__(self):
#         return f"review for {self.Product.title} by {self.user.username}" if self.product else "Deleted Review"
    
#     def total_score(self):
#         return f"{self.name}"
    
#     def save(self, *args, **kwargs):
#         # 리뷰 저장 시점에 점수도 ReviewScroe에 저장
#         super().save(*args, **kwargs)
#         ReviewScore.objects.update_or_create(
#             review= self,
#             defaults= {'scpre' : self.total_score()}
#         )
    
#     def delete(self, *args, **kwargs):  # 리뷰 삭제 유무 구분, 실제로 삭제하지 않고 논리적으로 삭제 처리
#         self.is_deleted= True
#         self.save()
 

# class ReviewScore(models.Modle):        # 리뷰 점수
#     review= models.OneToOneField(Review, on_delete= models.CASCADE)
#     score= models.IntegerField()