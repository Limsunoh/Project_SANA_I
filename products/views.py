from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, UpdateAPIView

from .models import Product, Image
from .serializers import (
    ProductListSerializer,
    ProductCreateSerializer,
    ProductDetailSerializer,
)
from .pagnations import ProductPagnation


class ProductListAPIView(ListCreateAPIView):
    queryset = Product.objects.all()
    pagination_class = ProductPagnation
    serializer_class = ProductListSerializer

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.serializer_class = ProductCreateSerializer
        images = request.FILES.getlist("images")
        if not images:  # 이미지 key error 처리
            return Response({"ERROR": "Image file is required."}, status=400)
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        images = self.request.FILES.getlist("images")
        product = serializer.save()
        for image in images:
            Image.objects.create(product=product, image_url=image)


class ProductDetailAPIView(UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductDetailSerializer(product)
        return Response(serializer.data, status=200)

    def perform_update(self, serializer):
        images_data = self.request.FILES.getlist("images")
        instance = serializer.instance  # 현재 수정 중인 객체

        # 요청에 이미지가 포함된 경우
        if images_data:
            # 기존 이미지 삭제
            instance.images.all().delete()
            for image_data in images_data:
                Image.objects.create(product=instance, image_url=image_data)

        serializer.save()

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response(status=204)
