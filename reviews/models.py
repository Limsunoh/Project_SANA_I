from django.db import models
from sbmarket import settings
from multiselectfield import MultiSelectField

CHECKLIST_OPTIONS = (
    ('quality', '품질이 우수해요'),
    ('good_value', '합리적인 가격이에요'),
    ('durability', '내구성이 뛰어나요'),
    ('customer_service', '친절하고 매너가 좋아요'),
    ('good_delivery', '거래약속을 잘 지켜요'),
    ('bad_quality', '영 좋지 않아요'),
    ('bad_value', '돈이 아까워요'),
    ('broken', '못 쓸 걸 팔았어요'),
    ('bad_service', '불친절하게 느껴졌어요'),
    ('bad_delivery', '시간을 안 지켜요')
)

class Review(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='reviews', on_delete=models.CASCADE
    )
    products = models.ForeignKey(
        'products.Product', related_name='reviewed_products', on_delete=models.CASCADE
    )
    checklist = MultiSelectField(choices=CHECKLIST_OPTIONS)  # 다중 선택 필드
    additional_comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    score = models.FloatField(default=0)  # 총점 계산

    def total_score(self):
        score_mapping = {
            'quality': 0.5,
            'good_value': 0.5,
            'durability': 0.5,
            'customer_service': 0.5,
            'good_delivery': 0.5,
            'bad_quality': -1,
            'bad_value': -1,
            'broken': -1,
            'bad_service': -1,
            'bad_delivery': -1
        }
        score = 0

        # 다중선택한 것들의 점수를 합치기
        for choice in self.checklist:
            score += score_mapping.get(choice, 0)
        return score

    def __str__(self):
        return f"{self.author.username} 의 {self.products.name} 에 대한 리뷰입니다"

    class Meta:
        unique_together = ('author', 'products')
