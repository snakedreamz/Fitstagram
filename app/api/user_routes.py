from flask import Blueprint, request
from flask_login import login_required
from app.forms.post_follower import NewFollow
from sqlalchemy import or_
from app.models import db, User, Post, Like
from app.forms import NewPost, EditPost
from app.awsupload import (
    upload_file_to_s3, allowed_file, get_unique_filename)
from .auth_routes import validation_errors_to_error_messages

user_routes = Blueprint('users', __name__)


@user_routes.route('/')
@login_required
def users():
    users = User.query.all()
    return {'users': [user.to_dict() for user in users]}


@user_routes.route('<term>')
@login_required
def searchUsers(term):
    users = User.query.filter(
        or_(
            User.nick_name.ilike(f"%{term}%"),
            User.username.ilike(f"%{term}%")
        )
    ).all()

    return {'users': [user.to_dict() for user in users]}


@user_routes.route('/<int:id>')
@login_required
def user(id):
    user = User.query.get(id)
    return user.to_dict()


@user_routes.route('/<int:id>/posts')
def get_users_posts(id):
    posts = Post.query.filter(Post.user_id == id)
    return {'posts': [post.to_dict() for post in posts]}


@user_routes.route('/posts')
def get_all_posts():
    posts = Post.query.all()
    return {'posts': [post.to_dict() for post in posts]}


@user_routes.route('/<int:id>/posts/new', methods=['POST'])
def create_post(id):
    form = NewPost()
    form['csrf_token'].data = request.cookies['csrf_token']
    if "image_url" not in form.data:
        return {"errors": "image required"}, 400

    image = form.data["image_url"]

    if not allowed_file(image.filename):
        return {"errors": "file type not permitted"}, 400

    image.filename = get_unique_filename(image.filename)

    upload = upload_file_to_s3(image)

    if "url" not in upload:
        # if the dictionary doesn't have a url key
        # it means that there was an error when we tried to upload
        # so we send back that error message
        return upload, 400

    url = upload["url"]
    if form.validate_on_submit():
        newPost = Post(user_id=form['user_id'].data,
                       content=form['content'].data, image_url=url)

        db.session.add(newPost)
        db.session.commit()
        return newPost.to_dict()
    else:
        return {'errors': validation_errors_to_error_messages(form.errors)}, 400


@user_routes.route('/<int:id>/posts/<int:post_id>/edit', methods=["PUT"])
def edit_post(id, post_id):
    form = EditPost()
    postToEdit = Post.query.get(int(post_id))
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        postToEdit.content = form.data['content']
        db.session.commit()
        return postToEdit.to_dict()
    else:
        return {'errors': validation_errors_to_error_messages(form.errors)}, 400


@user_routes.route('/<int:id>/posts/<int:post_id>/delete', methods=['DELETE'])
def delete_post(id, post_id):
    postToDelete = Post.query.get(int(post_id))
    db.session.delete(postToDelete)
    db.session.commit()
    return {'message': f"Deleted post {post_id}"}


@user_routes.route('<int:id>/follows')
@login_required
def myFollowers(id):
    user = User.query.get(id)
    return user.to_dict()['follows']


@user_routes.route('<int:id>/followers')
@login_required
def getMyFollowers(id):
    me = User.query.get(id)
    return {"followers": me.followers}


@user_routes.route('/follows/new', methods=['POST'])
@login_required
def createFollow():
    form = NewFollow()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        follower_id = form.data['follower_id']
        followed_id = form.data['followed_id']
        user = User.query.get(follower_id)
        follow = User.query.get(followed_id)
        follow.followUser(user)
        db.session.commit()
        return follow.to_dict_follows()


@user_routes.route('/<int:follower_id>/follows/<int:followed_id>/delete', methods=['DELETE'])
@login_required
def deleteFollow(follower_id, followed_id):
    user = User.query.get(follower_id)
    unfollowed = User.query.get(followed_id)
    unfollowed.unfollowUser(user)
    db.session.commit()
    return {
        'user': follower_id,
        'unfollowed': followed_id
    }
