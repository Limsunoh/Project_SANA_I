from django.db import models
from sbmarket import settings
from multiselectfield import MultiSelectField

CHECKLIST_OPTIONS = (
    ("quality", "품질이 우수해요"),
    ("good_value", "합리적인 가격이에요"),
    ("durability", "내구성이 뛰어나요"),
    ("customer_service", "친절하고 매너가 좋아요"),
    ("good_delivery", "거래약속을 잘 지켜요"),
    ("bad_quality", "사진과 너무 달라요"),
    ("bad_value", "돈이 아까워요"),
    ("broken", "못 쓸 걸 팔았어요"),
    ("bad_service", "불친절하게 느껴졌어요"),
    ("bad_delivery", "시간을 안 지켜요"),
)

class Review(models.Model):
    author = models.ForeignKey('accounts.User', related_name="reviews", on_delete=models.CASCADE)
    product = models.OneToOneField('products.Product', related_name="reviewed_product", on_delete=models.CASCADE)
    checklist = MultiSelectField(choices=CHECKLIST_OPTIONS)  # 다중 선택 필드
    additional_comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(default=0)  # 총점 계산
    
    # 리뷰 삭제 여부(리뷰 삭제 이후 재작성 불가하게끔 하기 위한 설정)
    is_deleted = models.BooleanField(default=False)  
    # 리뷰 삭제시 점수 유지(삭제 이후에도 점수가 변경되지않도록 하기 위한 설정)
    is_score_assigned = models.BooleanField(default=False) 
    
    def total_score(self):
        score_mapping = {
            "quality": 0.5,
            "good_value": 0.5,
            "durability": 0.5,
            "customer_service": 0.5,
            "good_delivery": 0.5,
            "bad_quality": -1,
            "bad_value": -1,
            "broken": -1,
            "bad_service": -1,
            "bad_delivery": -1,
        }
        score = 0

        # 다중 선택한 것들의 점수를 합치기
        for choice in self.checklist:
            score += score_mapping.get(choice, 0)
        return score

    # 리뷰를 생성할 때 OneToOne Field라서 Product 모델 자동 업데이트
    def save(self, *args, **kwargs):
        if not self.is_score_assigned:  # 처음 저장 시에만 점수 반영
            self.score = self.total_score()
            seller = self.product.author
            seller.total_score += self.score
            seller.save()
            self.is_score_assigned = True
        super().save(*args, **kwargs)
        
    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.save()

    def __str__(self):
        return f"{self.author.username} 의 {self.product.name} 에 대한 리뷰입니다"