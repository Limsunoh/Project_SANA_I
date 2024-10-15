from rest_framework import generics, permissions, serializers
from .serializers import ReviewSerializer
from products.models import Product
from .models import Review
from django.views.generic import TemplateView
from django.shortcuts import get_object_or_404


# 리뷰 목록 조회 및 생성
class ReviewListCreateView(generics.ListCreateAPIView):
    # queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        product_id = self.kwargs.get('product_id')

        if user_id:
            # 유저 프로필 페이지에서 해당 유저가 작성한 리뷰 조회
            return Review.objects.filter(author__id=user_id)
        elif product_id:
            # 제품 상세 페이지에서 해당 제품에 대한 리뷰 조회
            return Review.objects.filter(products__id=product_id)
        else:
            return Review.objects.none()  # 기본적으로 빈 쿼리셋 반환

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')

        if product_id:
            product = get_object_or_404(Product, pk=product_id)
            serializer.save(author=self.request.user, products=product)
        else:
            raise serializers.ValidationError("제품 ID가 필요합니다.")
        

# 리뷰 조회 및 삭제
class ReviewDetailView(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ReviewCreateView(TemplateView):
    template_name = 'review_create.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['product_id'] = kwargs.get('product_id')
        return context