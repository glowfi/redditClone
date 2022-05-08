import { Box } from '@chakra-ui/react';
import React from 'react';

interface WrapperProps {
    variant?: 'small' | 'regular';
}

export const Wrapper: React.FC<WrapperProps> = ({
    children,
    variant = 'regular'
}) => {
    return (
        <div>
            <Box
                maxWidth={variant === 'regular' ? '600px' : '400px'}
                w="100%"
                mt={8}
                mx={'auto'}
            >
                {children}
            </Box>
        </div>
    );
};
