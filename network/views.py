from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.models import User
from django import forms
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from .models import User, Posts, Comments

class PostForm(forms.Form):
    """Form for user posts"""
    thepost = forms.CharField(widget=forms.Textarea(attrs={'placeholder': 'Share your thoughts...', 'class' : 'form-control', 'rows' : '5'}))

@csrf_exempt
def index(request):
    if request.user.is_authenticated:
        form = PostForm()
        return render(request, "network/index.html", {
            "postform" : form
        })
    else:
        return HttpResponseRedirect(reverse("login"))


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    
@login_required
def makepost(request):
    if request.method == "POST":
        data = json.loads(request.body)

        user = request.user
        text = data.get("thetext", "")
        date = datetime.now()

        #Ensure valid text is entered to make a post
        if text == "":
            return JsonResponse({"error": "Post must have at least one character."}, status=400)

        new_post = Posts(
            poster=user,
            text=text,
            thedatetime=date
        )

        new_post.save()

        newpost = Posts.objects.get(pk=new_post.id)
        print(newpost.text)

        return JsonResponse({"newpost" : newpost.serialize(), "message": "Post made successfully."}, status=201, safe=False)
    else:
        return JsonResponse({"error": "Post request required."}, status=400)
    
def editpost(request, postid):
    if request.method == "PUT":

        data = json.loads(request.body)
        text = data.get("thetext", "")

        try:
            thepost = Posts.objects.get(pk=postid)
        except Posts.DoesNotExist:
            return JsonResponse({"error": "Post not found."}, status=404)
        
        if request.user != thepost.poster:
            return JsonResponse({"error": "You cannot edit this post."}, status=403)
        
        #Ensure valid text is entered to make a post
        if text == "":
            return JsonResponse({"error": "Post must have at least one character."}, status=400)
        
        thepost.text = text

        thepost.save()

        return JsonResponse({"message": "Edit made successfully."}, status=201)
    else:
        return JsonResponse({"error": "PUT request required."}, status=400)

@login_required
def updatelikes(request):
    if request.method == "POST":

        data = json.loads(request.body)
        thepostid = data.get("postid", "")

        #Checks if the post is found with the user listed in the likes
        #If the object does not exist, user is added in the likes
        try:
            thepost = Posts.objects.filter(pk=thepostid)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Post not found."}, status=404)

        #If the user alredy exist in the likes, the user is removed from the likes
        if request.user in thepost[0].liked_by.all():
            thepost[0].liked_by.remove(request.user)
        else:
            thepost[0].liked_by.add(request.user)

        return JsonResponse([apost.serialize() for apost in thepost], safe=False)

    else:
        return JsonResponse({"error": "POST request required."}, status=400)

def theposts(request, setting):
    if request.method == 'GET':
        
        current_user = User.objects.get(username=request.user)

        if setting == "all":
            theseposts = Posts.objects.all()
            theseposts = theseposts.order_by('-thedatetime')
            posts_length = len(theseposts)

        elif setting == "following":
            #Attempts to list any users that the user currently follows
            current_follows = current_user.following.all()
        
            #If user does not follow anyone, returns empty list
            if len(current_follows) == 0:
                return JsonResponse({"message" : "No posts."}, status=200)
            else:
                theseposts = Posts.objects.filter(poster__in=current_follows)
                theseposts = theseposts.order_by('-thedatetime')

            posts_length = len(theseposts)
        else:
            return JsonResponse({"error" : "Invalid setting."}, status=400)
        
        paginated = Paginator(theseposts, 10)

        page = request.GET.get('page')

        #Sets page to 1 is argument is not an integer, sets page to last page if argument is empty
        try:
            theseposts = paginated.page(page)
        except PageNotAnInteger:
            theseposts = paginated.page(1)
        except EmptyPage:
            theseposts = paginated.page(paginated.num_pages)
        
        return JsonResponse({"theposts" : [theposts.serialize() for theposts in theseposts], "postlength" : posts_length}, safe=False)

def profile(request, username):
    if request.method == "GET":
        try:
            profile = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
        
        #Filters post by selected user and orders by date/time
        theseposts = Posts.objects.filter(poster=profile)
        theseposts = theseposts.order_by('-thedatetime')

        posts = len(Posts.objects.filter(poster=profile))

        paginated = Paginator(theseposts, 10)

        page = request.GET.get('page')

        #Sets page to 1 is argument is not an integer, sets page to last page if argument is empty
        try:
            theseposts = paginated.page(page)
        except PageNotAnInteger:
            theseposts = paginated.page(1)
        except EmptyPage:
            theseposts = paginated.page(paginated.num_pages)

        render(request, "network/login.html")

        return JsonResponse({"profile": profile.serialize(), "posts": posts, "theseposts": [theseposts.serialize() for theseposts in theseposts]}, safe=False)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)
    
def checkfollows(request, username):
    if request.method == "POST":
        #Attemps to get user info of profile being viewed
        try:
            profile = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
        
        #Gets signed in user's profile
        userprofile = User.objects.get(username=request.user)
        
        #Gets follower list of the profile being viewed
        afollower = profile.followers.all()

        #If list is empty, user is added. If not, the user is removed.
        if userprofile not in afollower:
            profile.followers.add(request.user)
            userprofile.following.add(profile)
            return JsonResponse({"message" : "Successfully followed user."}, status=201)
        else:
            profile.followers.remove(request.user)
            userprofile.following.remove(profile)
            return JsonResponse({"message" : "Successfully unfollowed user."}, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)