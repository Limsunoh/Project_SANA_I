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
    product = models.ForeignKey(
        'products.Product', related_name='reviewed_products', on_delete=models.CASCADE
    )
    checklist = MultiSelectField(choices=CHECKLIST_OPTIONS)
    additional_comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    '''
    # 리뷰 점수 관리 로직 모음
    '''
    score = models.FloatField(default=0)  # 총점 계산
    # score = models.FloatField(default=0)  # 리뷰 점수 (체크리스트에서 계산된 점수)
    # base_score = models.FloatField(default=25)  # 기본 점수, 리뷰 앱에서 설정

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
        

        # 다중선택한 것들의 점수를 합치기
        for choice in self.checklist:
            score += score_mapping.get(choice, 0)
        return score

    def save(self, *args, **kwargs):
        # 리뷰를 생성할 때 Product 모델의 reviews 필드도 업데이트
        super().save(*args, **kwargs)
        product = self.product
        product.reviews = self  # Product의 reviews 필드를 이 Review로 업데이트
        product.save()  # Product 저장
        
        '''
         # 리뷰 점수 계산
        total_score = self.base_score  # 기본 점수로 초기화

        # 체크리스트에서 선택한 항목 점수 추가
        for choice in self.checklist:
            total_score += score_mapping.get(choice, 0)  # 체크리스트 선택 점수 추가
        
        return total_score

    def save(self, *args, **kwargs):
        # 체크리스트 점수 계산
        self.score = self.calculate_review_score()
        super().save(*args, **kwargs)

        # 리뷰 작성자의 점수를 업데이트
        if self.author != self.product.author:
            product_author = self.product.author
            
            # 해당 작성자에게 리뷰 점수 추가
            product_author.total_review_score += self.score  # 리뷰 점수 합산
            product_author.save()

    def calculate_review_score(self):
        # 체크리스트 항목 점수 계산
        return sum(self.checklist_items)  # 예시: 체크리스트 항목의 합계를 점수로 사용
    '''
    def __str__(self):
        return f"{self.author.username}의 {self.product.name}에 대한 리뷰입니다"

    class Meta:
        unique_together = ('author', 'product')
        
    # class Meta:
    #     constraints = [ 
    #         models.UniqueConstraint(fields=['author', 'product'], name='unique_review')
    #     ]
