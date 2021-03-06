import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createALike, deleteAlike, getPosts } from '../../store/post';
import { getFollowedUsers } from '../../store/followers';
import { Modal } from '../context/Modal';
import SinglePost from '../PostModal/SinglePost';
import CreateComment from '../CreateComment';
import './homepage.css';

export const HomepagePost = ({ post }) => {
  const [showModal, setShowModal] = useState(false);
  const sessionUser = useSelector((state) => state.session.user);
  const thisPost = useSelector((state) => state.posts[post.id]);
  const dispatch = useDispatch();

  const postCheker = (postArr) => {
    if (postArr.length > 1) {
      return (
        <>
          <div className="profile">
            <a
              href={`/users/${postArr[postArr.length - 1].user.id}`}
              className="comment-username"
            >
              {postArr[0].user.username}
            </a>
            <span className="comment-content">
              {postArr[postArr.length - 1].content}{' '}
            </span>
          </div>
          <div className="profile">
            <a
              href={`/users/${postArr[postArr.length - 2].user.id}`}
              className="comment-username"
            >
              {postArr[0].user.username}
            </a>
            <span className="comment-content">
              {postArr[postArr.length - 2].content}
            </span>
          </div>
        </>
      );
    } else if (postArr.length === 1) {
      return (
        <>
          <div className="profile">
            <a
              href={`/users/${postArr[0].user.id}`}
              className="comment-username"
            >
              {postArr[0].user.username}
            </a>
            <span className="comment-content">{postArr[0].content}</span>
          </div>
        </>
      );
    } else return null;
  };

  const handleLike = () => {
    const like = {
      user_id: sessionUser.id,
      post_id: post.id,
    };
    dispatch(createALike(like));
  };

  const handleUnlike = () => {
    if (sessionUser.id in post.likes) {
      dispatch(deleteAlike(post?.likes[sessionUser.id]?.id));
    }
  };

  let likeBtns = null;
  if (!post.likes.hasOwnProperty(sessionUser.id)) {
    likeBtns = <i className="far fa-heart like-icon" onClick={handleLike}></i>;
  } else if (sessionUser.id in thisPost.likes) {
    likeBtns = (
      <i className="fa fa-heart unlike-icon" onClick={handleUnlike}></i>
    );
  }
  return (
    <div className="homepage-post-container">
      <div className="homepage-post-header">
        <div className="homepage-post-profile">
          <img
            src={post?.user.profile_image_url}
            className="profile-pic"
            alt="profile-pic"
          />
          <a href={`/users/${post.user.id}`} className="profile-username">
            {post.user.username}
          </a>
        </div>
        <img
          src={`${post.image_url}`}
          className="homepage-post-img"
          onClick={() => setShowModal(true)}
          alt="post-pic"
        ></img>
        <div className="like-div">
          {likeBtns}
          <span> {Object.values(thisPost.likes).length} likes</span>
        </div>
        <div className="post-description-user">
          <a
            href={`/users/${post?.user?.id}`}
            className="profile-username-desc"
          >
            {post?.user?.username}
          </a>
          <span className="post-description">{post?.content}</span>
        </div>
        {postCheker(Object.values(post.comments))}
        <div onClick={() => setShowModal(true)} className="view-comments-div">
          <span className="view-comment-span">View all comments...</span>
        </div>
        <CreateComment
          post={post}
          showModal={showModal}
          setShowModal={setShowModal}
        />
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <SinglePost setShowModal={setShowModal} post={post} />
          </Modal>
        )}
      </div>
    </div>
  );
};

const Homepage = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  const sessionUser = useSelector((state) => state.session.user);
  const followed = useSelector((state) => state.follows);
  const posts = useSelector((state) => state.posts);

  useEffect(async () => {
    await dispatch(getPosts());
    await dispatch(getFollowedUsers(sessionUser.id));
    await setIsLoaded(true);
  }, [dispatch, sessionUser.id]);

  const followed_posts_arr = [];
  for (let post in posts) {
    let onePost = posts[post];
    if (onePost.user_id === sessionUser.id || onePost.user_id in followed) {
      followed_posts_arr.push(onePost);
    }
  }
  return (
    <>
      {isLoaded && (
        <div className="homepage-container">
          <div className="homepage-posts">
            {followed_posts_arr.map((post) => (
              <div key={post.id}>
                <HomepagePost post={post} />
              </div>
            ))}
          </div>
          <div className="homepage-footer">
            <span>Developed by Israel Romero</span>
            <div className="splash-icons">
              <a href="https://github.com/snakedreamz">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/israel-romero-917a54219/">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Homepage;
