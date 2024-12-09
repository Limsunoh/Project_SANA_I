from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from products.models import Product
from reviews.models import CHECKLIST_OPTIONS

from .models import Review
from .serializers import ReviewSerializer


# 리뷰 목록 조회 및 생성
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        product_id = self.kwargs.get("product_id")

        if user_id:
            # 유저 프로필 페이지에서 해당 유저가 작성한 리뷰 조회
            return Review.objects.filter(author__id=user_id, is_deleted=False)
        elif product_id:
            # 제품 상세 페이지에서 해당 제품에 대한 리뷰 조회
            return Review.objects.filter(product__id=product_id, is_deleted=False)
        else:
            return Review.objects.none()  # 기본적으로 빈 쿼리셋 반환

    def perform_create(self, serializer):
        product_id = self.kwargs.get("product_id")
        if product_id:
            product = get_object_or_404(Product, pk=product_id)

            # 리뷰가 이미 작성되었는지 체크
            if hasattr(product, "reviewed_product"):
                raise serializers.ValidationError("이 상품에는 이미 리뷰가 작성되었습니다.")

            # 거래 정보 확인
            chat_room = product.chatrooms.filter(buyer=self.request.user, status__is_sold=True).first()
            if not chat_room:
                raise serializers.ValidationError("리뷰는 해당 상품의 구매자만 작성할 수 있습니다.")

            # 리뷰 생성
            review = serializer.save(product=product, author=self.request.user)
            review.score = review.total_score()
            review.save()

            # 리뷰 점수 반영 여부 업데이트
            review.is_score_assigned = True
            review.save()


# 리뷰 조회 및 삭제
class ReviewDetailView(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_destroy(self, instance):
        if instance.is_score_assigned:
            instance.product.id
            instance.product.title
            instance.delete()  # 리뷰를 삭제해도 점수는 유지됨


# ------------------------------------------------------------------------------
# 리뷰 작성하는 template
class ReviewCreateView(TemplateView):
    template_name = "review_create.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["product_id"] = kwargs.get("product_id")
        context["checklist_options"] = CHECKLIST_OPTIONS
        return context
