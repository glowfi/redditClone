import { Box, Button, Textarea } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Navbar } from '../components/Navbar';
import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation } from '../generated/graphql';
import { urqlclient } from '../utils/urqlclient';
import { useIsAuth } from '../utils/useIsAuth';

export const CreatePost: React.FC<{}> = () => {
    const router = useRouter();
    useIsAuth();

    const [, create] = useCreatePostMutation();
    return (
        <>
            <Navbar />
            <Wrapper variant="regular">
                <Formik
                    initialValues={{ title: '', text: '' }}
                    onSubmit={async (values, { setErrors }) => {
                        console.log(values);
                        const { error } = await create({
                            title: values.title,
                            text: values.text
                        });
                        if (!error) {
                            router.push('/');
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField name="title" placeholder="title" />
                            <Box mt={4}>
                                <InputField
                                    name="text"
                                    placeholder="text"
                                    type="text"
                                />
                            </Box>
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={isSubmitting}
                            >
                                Create
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        </>
    );
};

export default withUrqlClient(urqlclient)(CreatePost);
