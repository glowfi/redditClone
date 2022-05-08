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
exports.UserResolver = void 0;
const argon2_1 = require("argon2");
const type_graphql_1 = require("type-graphql");
const uuid_1 = require("uuid");
const constants_1 = require("../constants");
const User_1 = require("../entities/User");
const sendEmail_1 = require("../utils/sendEmail");
let username__pass = class username__pass {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], username__pass.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], username__pass.prototype, "pass", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], username__pass.prototype, "email", void 0);
username__pass = __decorate([
    (0, type_graphql_1.InputType)()
], username__pass);
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    email(root, ctx) {
        if (ctx.req.session.userId === root._id) {
            return root.email;
        }
        return '';
    }
    hello() {
        return 'hello';
    }
    async Me(ctx) {
        if (!ctx.req.session.userId) {
            return null;
        }
        const user = await User_1.User.findOne({
            where: { _id: ctx.req.session.userId }
        });
        if (!user) {
            return null;
        }
        return user;
    }
    async forget_password(ctx, email) {
        const user = await User_1.User.findOne({ where: { email: email } });
        if (!user) {
            return true;
        }
        const token = (0, uuid_1.v4)();
        await ctx.redis.set(constants_1.fp_prefix + token, user._id, 'ex', 1000 * 60 * 60 * 24 * 3);
        await (0, sendEmail_1.sendEmail)(email, `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`);
        return true;
    }
    async change_password(ctx, token, password) {
        if (password.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Password must be greater than 3'
                    }
                ]
            };
        }
        const userId = await ctx.redis.get(constants_1.fp_prefix + token);
        if (!userId) {
            return {
                errors: [{ field: 'token', message: 'token expired' }]
            };
        }
        const user = await User_1.User.findOne({ where: { _id: parseInt(userId) } });
        if (!user) {
            return {
                errors: [
                    { field: 'token', message: 'token of another usr huh?' }
                ]
            };
        }
        user.pass = await (0, argon2_1.hash)(password);
        ctx.req.session.userId = user._id;
        await user.save();
        await ctx.redis.del(constants_1.fp_prefix + token);
        return {
            user: user
        };
    }
    async register(options, ctx) {
        const find = await User_1.User.findOne({
            where: { username: options.username }
        });
        const find1 = await User_1.User.findOne({ where: { email: options.email } });
        if (find) {
            return {
                errors: [{ field: 'username', message: 'username is taken' }]
            };
        }
        if (find1) {
            return {
                errors: [{ field: 'email', message: 'email is in use' }]
            };
        }
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'usernamemust be greater than two'
                    }
                ]
            };
        }
        if (!options.email.includes('@')) {
            return {
                errors: [
                    {
                        field: 'email',
                        message: 'enter a valid email'
                    }
                ]
            };
        }
        if (options.pass.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Password must be greater than 3'
                    }
                ]
            };
        }
        const user = new User_1.User();
        user.username = options.username;
        user.email = options.email;
        user.pass = await (0, argon2_1.hash)(options.pass);
        await user.save();
        ctx.req.session.userId = user._id;
        return {
            user: user
        };
    }
    async login(email_username, password, ctx) {
        const k = email_username.includes('@')
            ? { email: email_username }
            : { username: email_username };
        const user = await User_1.User.findOne({ where: k });
        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameoremail',
                        message: 'username or email does not exist'
                    }
                ]
            };
        }
        const verif = await (0, argon2_1.verify)(user.pass, password);
        if (!verif) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Password do not match'
                    }
                ]
            };
        }
        ctx.req.session.userId = user._id;
        return {
            user: user
        };
    }
    logout(ctx) {
        return new Promise((resolve) => {
            ctx.req.session.destroy((err) => {
                ctx.res.clearCookie(constants_1.COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                }
                resolve(true);
            });
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], UserResolver.prototype, "hello", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "Me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forget_password", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('token')),
    __param(2, (0, type_graphql_1.Arg)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "change_password", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [username__pass, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('email_username')),
    __param(1, (0, type_graphql_1.Arg)('password')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=UserResolver.js.map