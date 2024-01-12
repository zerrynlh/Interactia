# Interactia
A Twitter-like single-page application

![Interactia:]

Interactia is a dynamic single-page application built using mostly JavaScript. Python/Django was utilized for the backend. Two Django models were created to store information regarding users and posts.

Bootstrap was utilized for responsiveness as well as implementing pagination.

### Features:
New Post: Users can create text-based posts seamlessly
All Posts: A dedicated page displays posts from all users, showcasing usernames, content, timestamps, and like counts
Profile Page: Clicking on a username leads to a comprehensive profile page, revealing followers, following, and user posts
Following: Users can view posts exclusively from accounts they follow
Pagination: To enhance user experience, posts are paginated with "Next" and "Previous" navigation
Edit Post: Empowering users with the ability to edit their posts securely
"Like" and "Unlike": Intuitive like/unlike functionality for user engagement

#### Install dependencies:
>pip install -r requirements.txt

#### To run this application:
>python manage.py runserver
