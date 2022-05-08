import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgetPasswordMutation } from '../generated/graphql';
import { urqlclient } from '../utils/urqlclient';

export const Forgotpassword: React.FC<{}> = () => {
    const [, forgot] = useForgetPasswordMutation();
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ email: '' }}
                onSubmit={async (values, { setErrors }) => {
                    // console.log(values);
                    const res = await forgot({
                        email: values.email
                    });
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name="email" placeholder="email" />
                        <Button mt={4} type="submit" isLoading={isSubmitting}>
                            forgetPassword
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(urqlclient)(Forgotpassword);
