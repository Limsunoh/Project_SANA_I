from django.db import models
from multiselectfield import MultiSelectField

# 한글로 된 체크리스트 옵션
CHECKLIST_OPTIONS = (
    ("품질이 우수해요", "품질이 우수해요"),
    ("합리적인 가격이에요", "합리적인 가격이에요"),
    ("내구성이 뛰어나요", "내구성이 뛰어나요"),
    ("친절하고 매너가 좋아요", "친절하고 매너가 좋아요"),
    ("거래약속을 잘 지켜요", "거래약속을 잘 지켜요"),
    ("사진과 너무 달라요", "사진과 너무 달라요"),
    ("돈이 아까워요", "돈이 아까워요"),
    ("못 쓸 걸 팔았어요", "못 쓸 걸 팔았어요"),
    ("불친절하게 느껴졌어요", "불친절하게 느껴졌어요"),
    ("시간을 안 지켜요", "시간을 안 지켜요"),
)


class Review(models.Model):
    author = models.ForeignKey("backend_accounts.User", related_name="reviews", on_delete=models.CASCADE)
    product = models.OneToOneField("backend_products.Product", related_name="reviewed_product", on_delete=models.CASCADE)
    checklist = MultiSelectField(choices=CHECKLIST_OPTIONS)  # 다중 선택 필드
    additional_comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    score = models.FloatField(default=0)  # 총점 계산

    # 리뷰 삭제 여부(리뷰 삭제 이후 재작성 불가하게끔 하기 위한 설정)
    is_deleted = models.BooleanField(default=False)
    # 리뷰 삭제시 점수 유지(삭제 이후에도 점수가 변경되지않도록 하기 위한 설정)
    is_score_assigned = models.BooleanField(default=False)

    def total_score(self):
        # 한글 키에 맞춰 score_mapping 업데이트
        score_mapping = {
            "품질이 우수해요": 0.5,
            "합리적인 가격이에요": 0.5,
            "내구성이 뛰어나요": 0.5,
            "친절하고 매너가 좋아요": 0.5,
            "거래약속을 잘 지켜요": 0.5,
            "사진과 너무 달라요": -1,
            "돈이 아까워요": -1,
            "못 쓸 걸 팔았어요": -1,
            "불친절하게 느껴졌어요": -1,
            "시간을 안 지켜요": -1,
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
        return f"{self.author.username} 의 {self.product.title} 에 대한 리뷰입니다"
