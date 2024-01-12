from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField('self', related_name = "user_followers", blank=True, symmetrical=False)
    following = models.ManyToManyField('self', related_name = "user_following", blank=True, symmetrical=False)

    def __str__(self):
        return f"{self.username}"
    
    def serialize(self):
        return {
            "user": self.username,
            "followers": [followers.username for followers in self.followers.all()],
            "following": [following.username for following in self.following.all()]
        }

class Posts(models.Model):
    poster = models.ForeignKey(User, on_delete = models.CASCADE, related_name= "poster")
    text = models.TextField(max_length = 300)
    liked_by = models.ManyToManyField(User, related_name = "post_like", null=True)
    #Stops datetime from being saved every time the object is saved but automically adds time on first entry
    thedatetime = models.DateTimeField(auto_now=False, auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.poster.username,
            "content": self.text,
            "likes": [user.username for user in self.liked_by.all()],
            "time": self.thedatetime.strftime("%m/%d/%Y, %I:%M:%S %p")
        }

    def __str__(self):
        return f"{self.poster}: {self.text}"

class Comments(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE, related_name = "commenter")
    liked_by = models.ManyToManyField(User, related_name = "com_like", null=True)
    #Stops datetime from being saved every time the object is saved but automically adds time on first entry
    thedatetime = models.DateTimeField(auto_now=False, auto_now_add=True)
    text = models.TextField(max_length = 300)
    post = models.ForeignKey(Posts, on_delete = models.CASCADE, related_name = "post_comment")

    def __str__(self):
        return f"{self.user}: {self.text}"
