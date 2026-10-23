from django.urls import path

from . import views

urlpatterns = [
    path('', views.APIDocsView.as_view()),
    path('docs/', views.APIDocsView.as_view()),
    path('health/', views.HealthCheckView.as_view()),
    path('projects/', views.ProjectList.as_view()),
    path('projects/<slug:slug>/', views.ProjectDetail.as_view()),
    path('contact/', views.ContactCreate.as_view()),
    path('weather/', views.WeatherView.as_view()),
    path('rag/ask/', views.RAGAskView.as_view()),
    path('rag/stream/', views.RAGStreamView.as_view()),
]
