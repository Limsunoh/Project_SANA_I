from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .models import Review
from .serializers import ReviewSerializer
from rest_framework.permissions import IsAuthenticated


class ReviewViewSet(ModelViewSet):
    queryset= Review.objects.all()
    serializer_class= ReviewSerializer
    permission_classes= [IsAuthenticated]