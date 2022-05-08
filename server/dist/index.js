"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const posix_1 = __importDefault(require("path/posix"));
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constants_1 = require("./constants");
const Post_1 = require("./entities/Post");
const Updoot_1 = require("./entities/Updoot");
const User_1 = require("./entities/User");
const hello_1 = require("./resolvers/hello");
const PostResolver_1 = require("./resolvers/PostResolver");
const UserResolver_1 = require("./resolvers/UserResolver");
const main = async () => {
    const conn = await (0, typeorm_1.createConnection)({
        type: 'postgres',
        database: 'newdb',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        entities: [User_1.User, Post_1.Post, Updoot_1.Updoot],
        migrations: [posix_1.default.join(__dirname, './migrations/*')]
    });
    await conn.runMigrations();
    const app = (0, express_1.default)();
    let RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    let redis = new ioredis_1.default();
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3000',
        credentials: true
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
            disableTTL: true
        }),
        cookie: {
            maxAge: 3600 * 24 * 365 * 10 * 1000,
            httpOnly: true,
            secure: constants_1.__prod__,
            sameSite: 'lax'
        },
        saveUninitialized: false,
        secret: 'vsadn7sa9dus223jdsa21',
        resave: false
    }));
    const server = new apollo_server_express_1.ApolloServer({
        plugins: [(0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)()],
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, PostResolver_1.PostResolver, UserResolver_1.UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis })
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
//# sourceMappingURL=index.js.map