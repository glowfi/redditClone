import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useMeQuery } from '../generated/graphql';

export const useIsAuth = () => {
    const router = useRouter();
    const [{ data, fetching }] = useMeQuery({
        requestPolicy: 'cache-and-network'
    });
    useEffect(() => {
        if (!fetching && !data?.Me) {
            router.replace('/login?next=' + router.pathname);
        }
        console.log(data);
    }, [fetching, data, router]);
};
