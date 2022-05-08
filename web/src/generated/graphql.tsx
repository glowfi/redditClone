import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  change_password: UserResponse;
  createPost: Post;
  delPost?: Maybe<Post>;
  forget_password: Scalars['Boolean'];
  login?: Maybe<UserResponse>;
  logout: Scalars['Boolean'];
  register: UserResponse;
  updPost?: Maybe<Post>;
  vote: Scalars['Boolean'];
};


export type MutationChange_PasswordArgs = {
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationCreatePostArgs = {
  text: Scalars['String'];
  title: Scalars['String'];
};


export type MutationDelPostArgs = {
  id: Scalars['Int'];
};


export type MutationForget_PasswordArgs = {
  email: Scalars['String'];
};


export type MutationLoginArgs = {
  email_username: Scalars['String'];
  password: Scalars['String'];
};


export type MutationRegisterArgs = {
  options: Username__Pass;
};


export type MutationUpdPostArgs = {
  id: Scalars['Int'];
  title: Scalars['String'];
};


export type MutationVoteArgs = {
  postId: Scalars['Int'];
  value: Scalars['Int'];
};

export type Post = {
  __typename?: 'Post';
  _id: Scalars['Int'];
  createdAt: Scalars['String'];
  creator: User;
  creatorId: Scalars['Int'];
  points: Scalars['Int'];
  text: Scalars['String'];
  textSnippet: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['String'];
  voteStatus?: Maybe<Scalars['Int']>;
};

export type Posts = {
  __typename?: 'Posts';
  Posts: Array<Post>;
  hasMore: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  Me?: Maybe<User>;
  dispHello: Scalars['String'];
  getAll: Posts;
  getPost?: Maybe<Post>;
  hello: Scalars['String'];
};


export type QueryGetAllArgs = {
  cursor?: Maybe<Scalars['String']>;
  limit: Scalars['Int'];
};


export type QueryGetPostArgs = {
  id: Scalars['Int'];
};

export type Updoot = {
  __typename?: 'Updoot';
  post: Post;
  postId: Scalars['Float'];
  user: User;
  userId: Scalars['Float'];
  value: Scalars['Float'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['Int'];
  createdAt: Scalars['String'];
  email: Scalars['String'];
  updatedAt: Scalars['String'];
  updoots: Array<Updoot>;
  username: Scalars['String'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type Username__Pass = {
  email: Scalars['String'];
  pass: Scalars['String'];
  username: Scalars['String'];
};

export type RegularErrorFragment = { __typename?: 'FieldError', field: string, message: string };

export type RegularResponseFragment = { __typename?: 'UserResponse', errors?: Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, user?: Maybe<{ __typename?: 'User', _id: number, username: string }> };

export type RegularUserFragment = { __typename?: 'User', _id: number, username: string };

export type CreatePostMutationVariables = Exact<{
  title: Scalars['String'];
  text: Scalars['String'];
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'Post', title: string } };

export type ChangePasswordMutationVariables = Exact<{
  token: Scalars['String'];
  password: Scalars['String'];
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', change_password: { __typename?: 'UserResponse', errors?: Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, user?: Maybe<{ __typename?: 'User', _id: number, username: string }> } };

export type ForgetPasswordMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type ForgetPasswordMutation = { __typename?: 'Mutation', forget_password: boolean };

export type LoginMutationVariables = Exact<{
  email_username: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: Maybe<{ __typename?: 'UserResponse', errors?: Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, user?: Maybe<{ __typename?: 'User', _id: number, username: string }> }> };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RegisterMutationVariables = Exact<{
  username: Scalars['String'];
  email: Scalars['String'];
  pass: Scalars['String'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserResponse', errors?: Maybe<Array<{ __typename?: 'FieldError', field: string, message: string }>>, user?: Maybe<{ __typename?: 'User', _id: number, username: string }> } };

export type VoteMutationVariables = Exact<{
  value: Scalars['Int'];
  postId: Scalars['Int'];
}>;


export type VoteMutation = { __typename?: 'Mutation', vote: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', Me?: Maybe<{ __typename?: 'User', _id: number, username: string }> };

export type PostsQueryVariables = Exact<{
  limit: Scalars['Int'];
  cursor?: Maybe<Scalars['String']>;
}>;


export type PostsQuery = { __typename?: 'Query', getAll: { __typename?: 'Posts', hasMore: boolean, Posts: Array<{ __typename?: 'Post', _id: number, title: string, createdAt: string, textSnippet: string, voteStatus?: Maybe<number>, points: number, creator: { __typename?: 'User', _id: number, username: string } }> } };

export const RegularErrorFragmentDoc = gql`
    fragment RegularError on FieldError {
  field
  message
}
    `;
export const RegularUserFragmentDoc = gql`
    fragment RegularUser on User {
  _id
  username
}
    `;
export const RegularResponseFragmentDoc = gql`
    fragment RegularResponse on UserResponse {
  errors {
    ...RegularError
  }
  user {
    ...RegularUser
  }
}
    ${RegularErrorFragmentDoc}
${RegularUserFragmentDoc}`;
export const CreatePostDocument = gql`
    mutation createPost($title: String!, $text: String!) {
  createPost(title: $title, text: $text) {
    title
  }
}
    `;

export function useCreatePostMutation() {
  return Urql.useMutation<CreatePostMutation, CreatePostMutationVariables>(CreatePostDocument);
};
export const ChangePasswordDocument = gql`
    mutation ChangePassword($token: String!, $password: String!) {
  change_password(token: $token, password: $password) {
    ...RegularResponse
  }
}
    ${RegularResponseFragmentDoc}`;

export function useChangePasswordMutation() {
  return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument);
};
export const ForgetPasswordDocument = gql`
    mutation forgetPassword($email: String!) {
  forget_password(email: $email)
}
    `;

export function useForgetPasswordMutation() {
  return Urql.useMutation<ForgetPasswordMutation, ForgetPasswordMutationVariables>(ForgetPasswordDocument);
};
export const LoginDocument = gql`
    mutation Login($email_username: String!, $password: String!) {
  login(email_username: $email_username, password: $password) {
    ...RegularResponse
  }
}
    ${RegularResponseFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const RegisterDocument = gql`
    mutation Register($username: String!, $email: String!, $pass: String!) {
  register(options: {username: $username, email: $email, pass: $pass}) {
    ...RegularResponse
  }
}
    ${RegularResponseFragmentDoc}`;

export function useRegisterMutation() {
  return Urql.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument);
};
export const VoteDocument = gql`
    mutation vote($value: Int!, $postId: Int!) {
  vote(value: $value, postId: $postId)
}
    `;

export function useVoteMutation() {
  return Urql.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument);
};
export const MeDocument = gql`
    query Me {
  Me {
    ...RegularUser
  }
}
    ${RegularUserFragmentDoc}`;

export function useMeQuery(options: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
};
export const PostsDocument = gql`
    query Posts($limit: Int!, $cursor: String) {
  getAll(limit: $limit, cursor: $cursor) {
    hasMore
    Posts {
      _id
      title
      createdAt
      textSnippet
      voteStatus
      points
      creator {
        _id
        username
      }
    }
  }
}
    `;

export function usePostsQuery(options: Omit<Urql.UseQueryArgs<PostsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<PostsQuery>({ query: PostsDocument, ...options });
};