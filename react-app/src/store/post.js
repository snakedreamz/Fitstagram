const CREATE_POST = 'post/CREATE_POST';
const GET_ALL_POSTS = 'post/GET_POSTS';
const GET_USERS_POSTS = 'post/GET_USERS_POSTS';
const DELETE_POST = 'post/DELETE_POST';
const EDIT_POST = 'post/EDIT_POST';
const CREATE_COMMENT = 'post/CREATE_COMMENT';
const DELETE_COMMENT = 'post/DELETE_COMMENT';
const EDIT_COMMENT = 'post/EDIT_COMMENT';

const newPost = (post) => ({
  type: CREATE_POST,
  post,
});

const getAllPosts = (posts) => ({
  type: GET_ALL_POSTS,
  posts,
});

const getUsersPosts = (posts) => ({
  type: GET_USERS_POSTS,
  posts,
});

const editPost = (post) => ({
  type: EDIT_POST,
  post,
});

const deletePost = (id) => ({
  type: DELETE_POST,
  id,
});

const createComment = (comment) => ({
  type: CREATE_COMMENT,
  comment,
});

const editComment = (comment) => ({
  type: EDIT_COMMENT,
  comment,
});

const deleteComment = (comment) => ({
  type: DELETE_COMMENT,
  comment,
});

// Creates a post
export const createPost = (formdata) => async (dispatch) => {
  console.log('XXXXXXX this is it =====>', formdata.get('user_id'));
  const response = await fetch(
    `/api/users/${formdata.get('user_id')}/posts/new`,
    {
      method: 'POST',
      body: formdata,
    }
  );
  console.log('this is response', response);
  if (response.ok) {
    const post = await response.json();
    dispatch(newPost(post));
  } else if (response.status < 500) {
    const data = await response.json();
    if (data.errors) {
      return data.errors;
    }
  } else {
    return ['An error occurred. Please try again.'];
  }
};

// Gets a single users posts
export const getSingleUserPosts = (id) => async (dispatch) => {
  const response = await fetch(`/api/users/${id}/posts`);
  if (response.ok) {
    const posts = await response.json();
    dispatch(getUsersPosts(posts));
    return posts;
  }
};

// Gets all posts
export const getPosts = () => async (dispatch) => {
  const response = await fetch('/api/users/posts');
  if (response.ok) {
    const posts = await response.json();
    dispatch(getAllPosts(posts));
    return posts;
  }
};

//Edits a single post
export const editOnePost = (userid, content, id) => async (dispatch) => {
  const response = await fetch(`/api/users/${userid}/posts/${id}/edit`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (response.ok) {
    const edited = await response.json();
    dispatch(editPost(edited));
    return edited;
  }
};

//Delete a post
export const deleteOnePost = (userid, id) => async (dispatch) => {
  const response = await fetch(`/api/users/${userid}/posts/${id}/delete`, {
    method: 'DELETE',
  });
  if (response.ok) {
    const post = await response.json();
    dispatch(deletePost(id));
    return post;
  }
};

export const createAComment = (comment) => async (dispatch) => {
  const response = await fetch('/api/comments/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });

  if (response.ok) {
    const comment = await response.json();
    dispatch(createComment(comment));
    return comment;
  }
};

export const editAComment = (comment) => async (dispatch) => {
  const response = await fetch(`/api/comments/${comment.id}/edit`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
  if (response.ok) {
    const comment = await response.json();
    dispatch(editComment(comment));
    return comment;
  }
};

export const deleteAcomment = (id) => async (dispatch) => {
  const response = await fetch(`/api/comments/${id}/delete`, {
    method: 'DELETE',
  });
  if (response.ok) {
    const comment = await response.json();
    dispatch(deleteComment(comment));
    return comment;
  }
};

const initialState = {};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_POST: {
      const newState = {
        ...state,
        [action.post.id]: action.post,
      };
      return newState;
    }
    case GET_ALL_POSTS: {
      const newState = {
        ...state,
        ...action.posts.posts,
      };
      return newState;
    }
    case GET_USERS_POSTS: {
      console.log('BIG STRING.....123123123123', action);
      const newState = {
        ...state,
      };
      action.posts.posts.forEach((post) => {
        newState[post.id] = post;
      });
      return newState;
    }
    case EDIT_POST: {
      const newState = {
        ...state,
        [action.post.id]: action.post,
      };
      return newState;
    }

    case DELETE_POST: {
      const newState = {
        ...state,
      };
      delete newState[action.id];
      return newState;
    }
    case CREATE_COMMENT: {
      const newState = { ...state };
      console.log(action);
      newState[action.comment.post_id].comments[action.comment.id] =
        action.comment;
      return newState;
    }
    case EDIT_COMMENT: {
      const newState = { ...state };
      newState[action.comment.post_id].comments[action.comment.id] =
        action.comment;
      return newState;
    }
    case DELETE_COMMENT: {
      const newState = { ...state };
      delete newState[action.comment.post_id].comments[action.comment.id];
      return newState;
    }
    default:
      return state;
  }
};

export default postReducer;
