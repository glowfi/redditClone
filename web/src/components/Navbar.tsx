import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useMeQuery, useLogoutMutation } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const Navbar: React.FC<NavBarProps> = ({}) => {
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({
        pause: isServer(),
        requestPolicy: 'cache-and-network'
    });

    let body = null;

    // data is loading
    if (fetching) {
        // user not logged in
    } else if (!data?.Me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>register</Link>
                </NextLink>
            </>
        );
        // user is logged in
    } else {
        body = (
            <Flex>
                <Box mr={2}>{data.Me.username}</Box>
                <Button
                    onClick={() => {
                        logout();
                    }}
                    isLoading={logoutFetching}
                    variant="link"
                >
                    logout
                </Button>
            </Flex>
        );
    }

    return (
        <Flex bg="tan" p={4}>
            <Box ml={'auto'}>{body}</Box>
        </Flex>
    );
};
