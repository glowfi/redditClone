import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import Router from 'next/router';
import {
    dedupExchange,
    Exchange,
    fetchExchange,
    gql,
    stringifyVariables
} from 'urql';
import { pipe, tap } from 'wonka';
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
    VoteMutationVariables
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { isServer } from './isServer';

// export type MergeMode = 'before' | 'after';

// export interface PaginationParams {
//     cursorArgument?: string;
//     limitArgument?: string;
//     mergeMode?: MergeMode;
// }

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);
        console.log('allFields: ', allFields);
        const fieldInfos = allFields.filter(
            (info) => info.fieldName === fieldName
        );
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isItInTheCache = cache.resolveFieldByKey(entityKey, fieldKey);
        info.partial = !isItInTheCache;
        const results: string[] = [];
        let hasMore;
        fieldInfos.forEach((fi) => {
            // const data = cache.resolveFieldByKey(
            //     entityKey,
            //     fi.fieldKey
            // ) as string;

            const data = cache.resolve(
                cache.resolveFieldByKey(entityKey, fi.fieldKey) as string,
                'Posts'
            ) as any;
            console.log(data, 'see');
            const data1 = cache.resolve(
                cache.resolveFieldByKey(entityKey, fi.fieldKey) as string,
                'hasMore'
            );
            hasMore = data1;
            console.log(hasMore);
            results.push(...data);
        });

        return {
            __typename: 'Posts',
            Posts: results,
            hasMore
        };
    };
};

const errorExchange: Exchange =
    ({ forward }) =>
    (ops$) => {
        return pipe(
            forward(ops$),
            tap(({ error }) => {
                if (error?.message.includes('not authenticated')) {
                    Router.replace('/login');
                }
            })
        );
    };
export const urqlclient = (ssrExchange: any, ctx: any) => {
    let cookie = '';

    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie;
    }

    return {
        url: 'http://localhost:4000/graphql',
        fetchOptions: {
            credentials: 'include' as const,
            headers: cookie ? { cookie } : undefined
        },
        exchanges: [
            dedupExchange,
            cacheExchange({
                resolvers: {
                    Query: {
                        getAll: cursorPagination()
                    }
                },
                updates: {
                    Mutation: {
                        // logout: (_result, args, cache, info) => {
                        //     const fragment = MeDocument;
                        //     cache.updateQuery(
                        //         { query: fragment },
                        //         (data: MeQuery) => {
                        //             return {
                        //                 Me: null
                        //             };
                        //         }
                        //     );
                        // },
                        //
                        vote: (_result, args, cache, info) => {
                            const { postId, value } =
                                args as VoteMutationVariables;
                            const data = cache.readFragment(
                                gql`
                                    fragment _ on Post {
                                        _id
                                        points
                                        voteStatus
                                    }
                                `,
                                { _id: postId } as any
                            );

                            if (data.voteStatus === value) {
                                return;
                            }

                            if (data) {
                                const newPoints =
                                    (data.points as number) + value;
                                cache.writeFragment(
                                    gql`
                                        fragment __ on Post {
                                            points
                                            voteStatus
                                        }
                                    `,
                                    {
                                        _id: postId,
                                        points: newPoints,
                                        voteStatus: value
                                    } as any
                                );
                            }
                        },
                        createPost: (_result, args, cache, info) => {
                            const allFields = cache.inspectFields('Query');
                            const fieldInfos = allFields.filter(
                                (info) => info.fieldName === 'getAll'
                            );
                            fieldInfos.forEach((fi) => {
                                cache.invalidate(
                                    'Query',
                                    'getAll',
                                    fi.arguments || {}
                                );
                            });
                        },
                        logout: (_result, args, cache, info) => {
                            betterUpdateQuery<LogoutMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                () => ({ Me: null })
                            );
                        },
                        Login: (_result, args, cache, info) => {
                            betterUpdateQuery<LoginMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                (result, query) => {
                                    if (result.login.errors) {
                                        Me: result.login.user;
                                    } else {
                                        return {
                                            Me: result.login.user
                                        };
                                    }
                                }
                            );
                        },
                        Register: (_result, args, cache, info) => {
                            betterUpdateQuery<RegisterMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                (result, query) => {
                                    if (result.register.errors) {
                                        return query;
                                    } else {
                                        return {
                                            Me: result.register.user
                                        };
                                    }
                                }
                            );
                        }
                    }
                }
            }),
            errorExchange,
            ssrExchange,
            fetchExchange
        ]
    };
};
