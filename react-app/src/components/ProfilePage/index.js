import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSingleUserPosts } from '../../store/post';
import { loadProfile } from '../../store/userProfile';
import CreatePostForm from '../CreatePost';
import DeletePost from '../DeletePost';
import EditPost from '../EditPost';
import './profilepage.css';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const sessionUser = useSelector((state) => state.session.user);
  const posts = useSelector((state) => state.posts);
  const profile = useSelector((state) => state.profile);

  let { userId } = useParams();

  useEffect(async () => {
    await dispatch(loadProfile(userId));
    await dispatch(getSingleUserPosts(userId));
    if (!isLoaded) setIsLoaded(true);
  }, [dispatch, userId, sessionUser.id]);

  return (
    <>
      {isLoaded && (
        <div>
          {Object.values(profile?.posts)?.map((post, i) => {
            return (
              <div key={i}>
                <img src={post.image_url} />
                <div>{post.content}</div>
                <EditPost id={post.id} />
                <DeletePost id={post.id} />
              </div>
            );
          })}
          <CreatePostForm />
        </div>
      )}
    </>
  );
};

export default ProfilePage;
