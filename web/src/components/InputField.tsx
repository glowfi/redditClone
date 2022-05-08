import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input
} from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

// for generic's sake
type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string;
};
// type InputFieldProps = {
//     name: string;
//     placeholder: string;
//     type: string;
// };

export const InputField: React.FC<InputFieldProps> = ({
    size: _,
    ...props
}) => {
    const [field, { error }] = useField(props);
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{field.name}</FormLabel>
            <Input {...field} {...props} id={field.name} />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};
