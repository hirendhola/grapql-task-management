import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const startServer = async () => {
  const app = express();
  const prisma = new PrismaClient();

  const server = new ApolloServer({
    typeDefs: `
      type User {
        id: ID!
        name: String
        email: String!
        createdAt: String!
        updatedAt: String!
        todos: [Todo]
      }

      type Todo {
        id: ID!
        title: String!
        completed: Boolean!
        createdAt: String!
        updatedAt: String!
        user: User!
      }

      type Query {
        getTodos: [Todo]
        getAllUsers: [User]
        getUserById(id: ID!): User
      }

      type Mutation {
        createUser(name: String, email: String!): User
        createTodo(title: String!, userId: ID!): Todo
        updateTodo(id: ID!, title: String, completed: Boolean): Todo
        deleteTodo(id: ID!): String
      }
    `,
    resolvers: {
      Query: {
        getTodos: async () => {
          return await prisma.todo.findMany({ include: { user: true } });
        },
        getAllUsers: async () => {
          return await prisma.user.findMany({ include: { todos: true } });
        },
        getUserById: async (_, { id }) => {
          return await prisma.user.findUnique({
            where: { id },
            include: { todos: true },
          });
        },
      },
      Mutation: {
        createUser: async (_, { name, email }) => {
          return await prisma.user.create({
            data: { name, email },
          });
        },
        createTodo: async (_, { title, userId }) => {
          return await prisma.todo.create({
            data: { title, userId },
          });
        },
        updateTodo: async (_, { id, title, completed }) => {
          return await prisma.todo.update({
            where: { id },
            data: { title, completed },
          });
        },
        deleteTodo: async (_, { id }) => {
          await prisma.todo.delete({ where: { id } });
          return "Todo deleted successfully";
        },
      },
      Todo: {
        user: async (todo) => {
          return await prisma.user.findUnique({ where: { id: todo.userId } });
        },
      },
      User: {
        todos: async (user) => {
          return await prisma.todo.findMany({ where: { userId: user.id } });
        },
      },
    },
  });

  // Start the Apollo Server instance.
  await server.start();

  app.use(express.json());
  app.use(cors());
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        return {};
      },
    })
  );

  // A simple root route for testing.
  app.get("/", (req, res) => {
    res.send("Hey, it's working");
  });

  app.listen(4000, () => {
    console.log("Server running on http://localhost:4000/graphql");
  });
};

startServer();
