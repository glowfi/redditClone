"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
const Updoot_1 = require("../entities/Updoot");
const isAuth_1 = require("../utils/isAuth");
let Posts = class Posts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], Posts.prototype, "Posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], Posts.prototype, "hasMore", void 0);
Posts = __decorate([
    (0, type_graphql_1.ObjectType)()
], Posts);
let PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.slice(0, 50);
    }
    async getAll(limit, cursor, { req }) {
        const real_limit = limit;
        const replacement = [real_limit + 1];
        let cursorIdx = 3;
        if (cursor) {
            replacement.push(new Date(parseInt(cursor)));
            cursorIdx = replacement.length;
        }
        if (req.session.userId) {
            replacement.push(req.session.userId);
        }
        const posts = await (0, typeorm_1.getConnection)().query(`
    select p.*,
    json_build_object(
      '_id', u._id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator,
    ${req.session.userId
            ? '(select value from updoot where "userId" = $2 and "postId" = p._id) "voteStatus"'
            : 'null as "voteStatus"'}
    from post p
    inner join public.user u on u._id = p."creatorId"
${cursor ? `where p."createdAt" < $${cursorIdx}` : ''}
    order by p."createdAt" DESC
    limit $1
    `, replacement);
        return { Posts: posts, hasMore: posts.length === real_limit + 1 };
    }
    async vote(postId, value, ctx) {
        const v = value !== -1 ? 1 : -1;
        const userId = ctx.req.session.userId;
        const updoot = await Updoot_1.Updoot.findOne({ postId: postId, userId: userId });
        if (!updoot) {
            await Updoot_1.Updoot.insert({ userId: userId, postId: postId, value: v });
            await (0, typeorm_1.getConnection)().query(`
                                    update post 
                                    set points=points+$1
                                    where _id=$2
                                    `, [v, postId]);
            return true;
        }
        else if (updoot && updoot.value !== v) {
            await (0, typeorm_1.getConnection)().query(`
                                    update updoot 
                                    set value=$1
                                    where "postId"=$2 and "userId"=$3
                                    `, [v, postId, userId]);
            await (0, typeorm_1.getConnection)().query(`
                                    update post 
                                    set points=points+$1
                                    where _id=$2
                                    `, [v, postId]);
            return true;
        }
        return false;
    }
    async getPost(id) {
        const one = await Post_1.Post.findOne({
            where: { _id: id }
        });
        if (one) {
            return one;
        }
        return null;
    }
    async createPost(title, text, ctx) {
        return Post_1.Post.create({
            title: title,
            text: text,
            creatorId: ctx.req.session.userId
        }).save();
    }
    async updPost(id, title) {
        const post = await Post_1.Post.findOne({ where: { _id: id } });
        if (!post) {
            return null;
        }
        if (post.title) {
            post.title = title;
            await post.save();
        }
        return post;
    }
    async delPost(id) {
        const post = await Post_1.Post.findOne({ where: { _id: id } });
        if (!post) {
            return null;
        }
        await post.remove();
        return post;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.Query)(() => Posts),
    __param(0, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('cursor', () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getAll", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('postId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('value', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('title', () => String)),
    __param(1, (0, type_graphql_1.Arg)('text', () => String)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('title', () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "delPost", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=PostResolver.js.map