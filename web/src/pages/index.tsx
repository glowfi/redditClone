import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Link,
    Stack,
    Text
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Wrapper } from '../components/Wrapper';
import { usePostsQuery, useVoteMutation } from '../generated/graphql';
import { urqlclient } from '../utils/urqlclient';

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 10,
        cursor: null as null | string
    });
    const [{ data, fetching }] = usePostsQuery({
        variables
    });

    const [, vote] = useVoteMutation();

    const [loading, setloading] = useState<
        'not-loading' | 'upv-loading' | 'dwv-loading'
    >('not-loading');

    if (!fetching && !data) {
        return (
            <div>
                <h1>Query Failed</h1>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <Box mr={'0'}>
                <NextLink href="/createPost">
                    <Link mr={2}>Create Post?</Link>
                </NextLink>
            </Box>

            <br />
            {!data ? (
                <div>loading...</div>
            ) : (
                <Wrapper variant="regular">
                    <Stack spacing={8}>
                        {data.getAll.Posts.map((p) => (
                            <Box
                                p={5}
                                shadow="md"
                                borderWidth="1px"
                                key={p._id}
                            >
                                <Heading fontSize="xl">{p.title}</Heading>
                                <Text mt={4}>{p.textSnippet}</Text>
                                <Text mt={4}>
                                    Posted by : {p.creator.username}
                                </Text>
                                <Flex
                                    direction={'column'}
                                    justifyContent={'center'}
                                    justifyItems={'center'}
                                >
                                    <Box>
                                        <IconButton
                                            aria-label="ChevronUpIcon"
                                            background={
                                                p.voteStatus === 1
                                                    ? 'green.600'
                                                    : 'gray.200'
                                            }
                                            onClick={() => {
                                                setloading('upv-loading');
                                                console.log('hello');
                                                vote({
                                                    value: 1,
                                                    postId: p._id
                                                });
                                                setloading('not-loading');
                                            }}
                                            isLoading={
                                                loading === 'upv-loading'
                                            }
                                        >
                                            <ChevronUpIcon />
                                        </IconButton>
                                    </Box>
                                    <Flex>
                                        <Box>{p.points}</Box>
                                    </Flex>
                                    <Box>
                                        <IconButton
                                            aria-label="ChevronDownIcon"
                                            background={
                                                p.voteStatus === -1
                                                    ? 'red'
                                                    : 'gray.200'
                                            }
                                            onClick={() => {
                                                setloading('dwv-loading');
                                                vote({
                                                    value: -1,
                                                    postId: p._id
                                                });
                                                setloading('not-loading');
                                            }}
                                            isLoading={
                                                loading === 'dwv-loading'
                                            }
                                        >
                                            <ChevronDownIcon />
                                        </IconButton>
                                    </Box>
                                </Flex>
                            </Box>
                        ))}
                    </Stack>
                    <Flex>
                        {!fetching && data.getAll.hasMore ? (
                            <Button
                                m={'auto'}
                                my={8}
                                isLoading={fetching}
                                onClick={() => {
                                    setVariables({
                                        limit: variables.limit + 40,
                                        cursor: data.getAll.Posts[
                                            data.getAll.Posts.length - 1
                                        ].createdAt
                                    });
                                }}
                            >
                                Loadmore
                            </Button>
                        ) : null}
                    </Flex>
                </Wrapper>
            )}
        </>
    );
};

export default withUrqlClient(urqlclient, { ssr: true })(Index);
