import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { urqlclient } from '../utils/urqlclient';

const Register: React.FC<{}> = () => {
    const [, register] = useRegisterMutation();
    const router = useRouter();
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ username: '', email: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    console.log(values);
                    const res = await register({
                        username: values.username,
                        email: values.email,
                        pass: values.password
                    });
                    if (res.data.register.errors) {
                        let k = res.data.register.errors[0];
                        let obj = {};
                        obj[k.field] = k.message;
                        setErrors(obj);
                        console.log(k);
                    } else {
                        console.log(res);
                        router.push('/');
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name="username" placeholder="username" />
                        <InputField
                            name="email"
                            placeholder="email"
                            type="email"
                        />

                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                type="password"
                            />
                        </Box>
                        <Button mt={4} type="submit" isLoading={isSubmitting}>
                            register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(urqlclient)(Register);
