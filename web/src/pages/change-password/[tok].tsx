import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import router, { useRouter } from 'next/dist/client/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { urqlclient } from '../../utils/urqlclient';
import NextLink from 'next/link';

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
    const [, change] = useChangePasswordMutation();
    const [tokenmsg, setTokenmsg] = useState('');
    const route = useRouter();

    console.log(route.query);
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    console.log(values);
                    const res = await change({
                        token:
                            typeof route.query.tok === 'string'
                                ? route.query.tok
                                : '',
                        password: values.password
                    });
                    if (res.data.change_password.errors) {
                        let k = res.data.change_password.errors[0];
                        let obj = {};
                        if (k.field === 'token') {
                            setTokenmsg(k.message);
                        } else {
                            obj[k.field] = k.message;
                            setErrors(obj);
                            console.log(k);
                        }
                    } else {
                        console.log(res);
                        router.push('/');
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="password"
                            placeholder="password"
                            type="password"
                        />
                        <Button mt={4} type="submit" isLoading={isSubmitting}>
                            change password
                        </Button>
                        <Box color={'red'}>
                            {tokenmsg ? (
                                <div>
                                    {tokenmsg}
                                    <div>
                                        <NextLink href="/forgotpassword">
                                            <Link mr={2} color={'black'}>
                                                request new token
                                            </Link>
                                        </NextLink>
                                    </div>
                                </div>
                            ) : null}
                        </Box>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.tok as string
    };
};

export default withUrqlClient(urqlclient)(ChangePassword);
