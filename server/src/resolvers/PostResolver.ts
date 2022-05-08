import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Updoot } from '../entities/Updoot';
import { myCtx } from '../myCtx';
import { isAuth } from '../utils/isAuth';

@ObjectType()
class Posts {
    @Field(() => [Post])
    Posts!: Post[];

    @Field(() => Boolean)
    hasMore!: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @Query(() => Posts)
    async getAll(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        @Ctx() { req }: myCtx
    ): Promise<Posts> {
        const real_limit = limit;
        //@ts-ignore
        const replacement: any[] = [real_limit + 1];

        let cursorIdx = 3;
        if (cursor) {
            replacement.push(new Date(parseInt(cursor)));
            cursorIdx = replacement.length;
        }

        //@ts-ignore
        if (req.session.userId) {
            //@ts-ignore
            replacement.push(req.session.userId);
        }

        const posts = await getConnection().query(
            `
    select p.*,
    json_build_object(
      '_id', u._id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator,
    ${
        //@ts-ignore
        req.session.userId
            ? '(select value from updoot where "userId" = $2 and "postId" = p._id) "voteStatus"'
            : 'null as "voteStatus"'
    }
    from post p
    inner join public.user u on u._id = p."creatorId"
${cursor ? `where p."createdAt" < $${cursorIdx}` : ''}
    order by p."createdAt" DESC
    limit $1
    `,
            replacement
        );

        //         const qb = getConnection()
        //             .getRepository(Post)
        //             .createQueryBuilder('p')
        //             .orderBy('"createdAt"', 'DESC')
        //             .take(real_limit + 1);

        //         if (cursor) {
        //             qb.where('"createdAt" < :cursor', {
        //                 cursor: new Date(parseInt(cursor))
        //             });
        //         }
        //         const posts = await qb.getMany();

        return { Posts: posts, hasMore: posts.length === real_limit + 1 };
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() ctx: myCtx
    ) {
        const v = value !== -1 ? 1 : -1;
        //@ts-ignore
        const userId = ctx.req.session.userId;

        const updoot = await Updoot.findOne({ postId: postId, userId: userId });

        if (!updoot) {
            await Updoot.insert({ userId: userId, postId: postId, value: v });
            await getConnection().query(
                `
                                    update post 
                                    set points=points+$1
                                    where _id=$2
                                    `,
                [v, postId]
            );
            return true;
        }
        // if user have already voted and they are upvoting/downvoting
        else if (updoot && updoot.value !== v) {
            await getConnection().query(
                `
                                    update updoot 
                                    set value=$1
                                    where "postId"=$2 and "userId"=$3
                                    `,
                [v, postId, userId]
            );
            await getConnection().query(
                `
                                    update post 
                                    set points=points+$1
                                    where _id=$2
                                    `,
                [v, postId]
            );
            return true;
        }

        return false;
    }

    @Query(() => Post, { nullable: true })
    async getPost(@Arg('id', () => Int) id: number): Promise<Post | null> {
        const one = await Post.findOne({
            where: { _id: id }
        });
        if (one) {
            return one;
        }
        return null;
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('title', () => String) title: string,
        @Arg('text', () => String) text: string,
        @Ctx() ctx: myCtx
    ): Promise<Post> {
        return Post.create({
            title: title,
            text: text,
            //@ts-ignore
            creatorId: ctx.req.session.userId
        }).save();
    }

    @Mutation(() => Post, { nullable: true })
    async updPost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { _id: id } });
        if (!post) {
            return null;
        }
        if (post.title) {
            post.title = title;
            await post.save();
        }
        return post;
    }

    @Mutation(() => Post, { nullable: true })
    async delPost(@Arg('id', () => Int) id: number): Promise<Post | null> {
        const post = await Post.findOne({ where: { _id: id } });
        if (!post) {
            return null;
        }
        await post.remove();
        return post;
    }
}
