import { hash, verify } from 'argon2';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root
} from 'type-graphql';
import { v4 } from 'uuid';
import { COOKIE_NAME, fp_prefix } from '../constants';
import { User } from '../entities/User';
import { myCtx } from '../myCtx';
import { sendEmail } from '../utils/sendEmail';

@InputType()
class username__pass {
    @Field()
    username: string;

    @Field()
    pass: string;

    @Field()
    email: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() root: User, @Ctx() ctx: myCtx) {
        //@ts-ignore
        if (ctx.req.session.userId === root._id) {
            return root.email;
        }
        return '';
    }

    @Query(() => String)
    hello(): string {
        return 'hello';
    }

    @Query(() => User, { nullable: true })
    async Me(@Ctx() ctx: myCtx): Promise<User | null> {
        //@ts-ignore
        if (!ctx.req.session.userId) {
            return null;
        }

        const user = await User.findOne({
            //@ts-ignore
            where: { _id: ctx.req.session.userId }
        });

        if (!user) {
            return null;
        }
        return user;
    }

    @Mutation(() => Boolean)
    async forget_password(@Ctx() ctx: myCtx, @Arg('email') email: string) {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return true;
        }
        const token = v4();
        await ctx.redis.set(
            fp_prefix + token,
            user._id,
            'ex',
            1000 * 60 * 60 * 24 * 3
        );
        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
        );
        return true;
    }

    @Mutation(() => UserResponse)
    async change_password(
        @Ctx() ctx: myCtx,
        @Arg('token') token: string,
        @Arg('password') password: string
    ): Promise<UserResponse> {
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
        const userId = await ctx.redis.get(fp_prefix + token);
        if (!userId) {
            return {
                errors: [{ field: 'token', message: 'token expired' }]
            };
        }

        const user = await User.findOne({ where: { _id: parseInt(userId) } });

        if (!user) {
            return {
                errors: [
                    { field: 'token', message: 'token of another usr huh?' }
                ]
            };
        }

        user.pass = await hash(password);
        //@ts-ignore
        ctx.req.session!.userId = user._id;
        await user.save();
        await ctx.redis.del(fp_prefix + token);
        return {
            user: user
        };
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: username__pass,
        @Ctx() ctx: myCtx
    ): Promise<UserResponse> {
        const find = await User.findOne({
            where: { username: options.username }
        });
        const find1 = await User.findOne({ where: { email: options.email } });

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
        const user = new User();
        user.username = options.username;
        user.email = options.email;
        user.pass = await hash(options.pass);
        await user.save();
        //@ts-ignore
        ctx.req.session!.userId = user._id;

        return {
            user: user
        };
    }

    @Mutation(() => UserResponse, { nullable: true })
    async login(
        @Arg('email_username') email_username: string,
        @Arg('password') password: string,
        @Ctx() ctx: myCtx
    ): Promise<UserResponse | null> {
        const k = email_username.includes('@')
            ? { email: email_username }
            : { username: email_username };

        const user = await User.findOne({ where: k });
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
        const verif = await verify(user.pass, password);
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
        //@ts-ignore
        ctx.req.session!.userId = user._id;
        return {
            user: user
        };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() ctx: myCtx) {
        return new Promise((resolve) => {
            ctx.req.session.destroy((err) => {
                ctx.res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                }

                resolve(true);
            });
        });
    }
}
