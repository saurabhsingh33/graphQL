const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: String
    }
    type User {
        id: ID!
        name: String!
        email: String!
        password: String
        status: String!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type postData {
        posts: [Post!]!
        totalPosts: Int!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    input userData {
        email: String!
        name: String!
        password: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts: postData!
        post(postId: ID!): Post!
        user: User!
    }

    type RootMutation {
        createUser(userInput: userData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
        deletePost(id: ID!): Boolean
        updateStatus(status: String!): User!
    }  

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);