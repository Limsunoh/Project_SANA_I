from django.db import models
from sbmarket import settings
from multiselectfield import MultiSelectField
from django.db.models import Sum

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
    product = models.OneToOneField(  # 수정: 단수형으로 변경
        'products.Product', related_name='reviewed_products', on_delete=models.CASCADE
    )
    checklist = MultiSelectField(choices=CHECKLIST_OPTIONS)
    additional_comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    '''
    # 리뷰 점수 관리 로직 모음
    '''
    score = models.FloatField()  # 리뷰 점수

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
        } # 선택되지 않은 체크리스트 값 = 0
        score = 0

        # 리뷰 한 개 / 선택한 항목 점수를 합한 값 추가 로직
        for choice in self.checklist:
            score += score_mapping.get(choice, 0)
        return score

    def save(self, *args, **kwargs):
        # 점수 계산
        self.score = self.total_score()  # 리뷰 점수 계산

        # 유저의 기본 점수 조정
        if hasattr(self.author, 'base_score'):  # base_score 속성 체크
            self.author.base_score = 25         # 유저 최초 리뷰점수
        self.author.base_score += self.score    # 리뷰 점수를 유저 점수에 추가
        self.author.save()  # 유저에 저장
        
        # 리뷰에 저장
        super().save(*args, **kwargs) 

    def __str__(self):
        return f"{self.author.username}의 {self.product.name}에 대한 리뷰입니다"

    class Meta:
        constraints = [ 
            models.UniqueConstraint(fields=['author', 'product'], name='unique_review')
        ]
