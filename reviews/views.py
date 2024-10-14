from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer
from rest_framework import status


# 리뷰 목록 조회 및 생성
class ReviewListCreateView(generics.ListCreateAPIView):
    # queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_pk = self.kwargs['product_id']
        return Review.objects.filter(prodcucts__pk= product_pk)
    
    def perform_create(self, serializer):
        # 점수 계산 후 저장
        # serializer.save(author=self.request.user)
        serializer.save() 

# 리뷰 조회 및 삭제
class ReviewDetailView(generics.RetrieveDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({"message": "리뷰가 성공적으로 삭제되었습니다."}, status=200)