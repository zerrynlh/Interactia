
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("makepost", views.makepost, name="makepost"),
    path("updatelikes", views.updatelikes, name="updatelikes"),
    path("theposts/<str:setting>", views.theposts, name="theposts"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("follow/<str:username>", views.checkfollows, name="following"),
    path("editpost/<int:postid>", views.editpost, name="edit")
]
