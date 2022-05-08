import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import path from 'path/posix';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { Post } from './entities/Post';
import { Updoot } from './entities/Updoot';
import { User } from './entities/User';
import { myCtx } from './myCtx';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/PostResolver';
import { UserResolver } from './resolvers/UserResolver';

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'newdb',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        entities: [User, Post, Updoot],
        migrations: [path.join(__dirname, './migrations/*')]
    });
    await conn.runMigrations();

    // await Post.delete({});
    // await User.delete({});
    const app = express();

    let RedisStore = connectRedis(session);
    let redis = new Redis();

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
                disableTTL: true
            }),
            cookie: {
                maxAge: 3600 * 24 * 365 * 10 * 1000,
                httpOnly: true, //client side cannot access it
                secure: __prod__, //only in production
                sameSite: 'lax' //csrf safety
            },
            saveUninitialized: false,
            secret: 'vsadn7sa9dus223jdsa21',
            resave: false
        })
    );

    const server = new ApolloServer({
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): myCtx => ({ req, res, redis })
    });
    await server.start();
    server.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log('Started ...');
    });
};

main()
    .then(() => {
        console.log('hello');
    })
    .catch((err) => {
        console.log(err);
    });
