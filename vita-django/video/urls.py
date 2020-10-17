from rest_framework import routers
from django.urls import path, include

from . import views


router = routers.DefaultRouter()
router.register(r'video-list', views.VideoViewSet)
router.register(r'comment-list', views.CommentViewSet)

urlpatterns = [
    path('<str:pk>/comments/', views.comment), # For Viewing comments of particular video
    path('', include(router.urls)),
]