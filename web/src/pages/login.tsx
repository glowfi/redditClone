import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { urqlclient } from '../utils/urqlclient';
import NextLink from 'next/link';

const Login: React.FC<{}> = () => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    // console.log(router);
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ usernameoremail: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    // console.log(values);
                    const res = await login({
                        email_username: values.usernameoremail,
                        password: values.password
                    });
                    if (res.data?.login.errors) {
                        let k = res.data?.login.errors[0];
                        let obj = {};
                        obj[k.field] = k.message;
                        setErrors(obj);
                        // console.log(k);
                    } else if (res.data?.login.user) {
                        // console.log(res);
                        //
                        // if (typeof router.query.next === 'string') {
                        // router.push('/');
                        // router.push(router.query.next);
                        // } else {
                        // worked
                        router.push('/');
                        // }
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="usernameoremail"
                            placeholder="usernameoremail"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                type="password"
                            />
                        </Box>
                        <Button mt={4} type="submit" isLoading={isSubmitting}>
                            login
                        </Button>
                        <NextLink href="/forgotpassword">
                            <Link mr={2}>Forgot Password?</Link>
                        </NextLink>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(urqlclient)(Login);
