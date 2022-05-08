"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const constants_1 = require("./constants");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
exports.default = {
    migrations: {
        path: (0, path_1.join)(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: [Post_1.Post, User_1.User],
    dbName: 'dbt',
    type: 'postgresql',
    debug: !constants_1.__prod__
};
//# sourceMappingURL=mikro-orm.config.js.map